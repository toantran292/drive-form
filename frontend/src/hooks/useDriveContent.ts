import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as driveApi from '@/app/api/drive';
import { toast } from 'sonner';
import { DriveItem } from '@/app/api/drive';
import { getUploadUrl, saveFile, uploadFileToStorage } from '@/app/api/drive';
import axios from 'axios';
import { useShareDialog } from './useShareDialog';

export interface PreviewData {
    url: string;
    signedUrl: string;
}

interface CreateFolderResponse {
    success: boolean;
    folder?: DriveItem;
    message?: string;
}

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
];

export function useDriveContent(currentFolderId?: string) {
    const router = useRouter();
    const [items, setItems] = useState<driveApi.DriveItem[]>([]);
    const [selectedFile, setSelectedFile] = useState<driveApi.DriveItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<{
        [key: string]: {
            progress: number;
            name: string;
        }
    }>({});
    const shareDialog = useShareDialog();

    const loadFiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const files = await driveApi.listFiles(currentFolderId);
            setItems(files);
        } catch (error) {
            console.error('Failed to load files:', error);
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    }, [currentFolderId]);

    const handleFileClick = async (item: driveApi.DriveItem) => {
        if (item.type === 'form') {
            router.push(`/forms/${item.formId}`);
            return;
        }

        if (item.type === 'file') {
            setSelectedFile(item);
            setIsPreviewLoading(true);

            try {
                const response = await driveApi.getPreviewUrl(item.id);
                if (!response.success || !response.url) {
                    throw new Error('Failed to get preview URL');
                }
                setPreviewData({
                    url: response.url,
                    signedUrl: response.url
                });
            } catch (error) {
                toast.error('Failed to preview file');
                setSelectedFile(null);
            } finally {
                setIsPreviewLoading(false);
            }
        }

        if (item.type === 'folder') {
            router.push(`?folderId=${item.id}`);
            return;
        }
    };

    const handleUpload = useCallback(async (file: File) => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            toast.error('Only images and PDF files are allowed');
            return;
        }

        const fileId = `${Date.now()}-${file.name}`;
        try {
            // Khởi tạo trạng thái upload
            setUploadingFiles(prev => ({
                ...prev,
                [fileId]: {
                    progress: 0,
                    name: file.name
                }
            }));

            // 1. Lấy signed URL để upload
            const { url, path } = await getUploadUrl({
                fieldname: 'file',
                originalname: file.name,
                mimetype: file.type,
                size: file.size,
                encoding: '7bit',
                buffer: null
            }, currentFolderId);

            // 2. Upload file lên storage với progress
            await uploadFileToStorage(url, file, (progress) => {
                setUploadingFiles(prev => ({
                    ...prev,
                    [fileId]: {
                        ...prev[fileId],
                        progress
                    }
                }));
            });

            // 3. Lưu thông tin file vào database
            const { file: savedFile } = await saveFile({
                fieldname: 'file',
                originalname: file.name,
                mimetype: file.type,
                size: file.size,
                encoding: '7bit',
                storagePath: path
            }, currentFolderId);

            // 4. Cập nhật state
            setItems(prev => [...prev, savedFile]);
            toast.success('File uploaded successfully');
            return savedFile;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || 'Upload failed';
                toast.error(message);
                throw new Error(message);
            }
            toast.error('Upload failed. Please try again.');
            throw error;
        } finally {
            // Xóa trạng thái upload khi hoàn thành hoặc lỗi
            setUploadingFiles(prev => {
                const newState = { ...prev };
                delete newState[fileId];
                return newState;
            });
        }
    }, [currentFolderId]);

    const handleUploadComplete = (file: driveApi.DriveItem, parentId?: string) => {
        if (parentId === currentFolderId) {
            setItems(prev => [...prev, file]);
        }

        toast.success('File uploaded successfully');
    };

    const handleDeleteFile = async (file: driveApi.DriveItem) => {
        try {
            await driveApi.deleteFile(file.id);
            setItems(prev => prev.filter(item => item.id !== file.id));
            if (selectedFile?.id === file.id) {
                setSelectedFile(null);
            }
            toast.success('File deleted successfully');
        } catch (error) {
            toast.error('Failed to delete file');
        }
    };

    const handleShare = (item: driveApi.DriveItem) => {
        shareDialog.openShare({
            id: item.id,
            name: item.name
        });
    };

    const handleDownload = async (item: driveApi.DriveItem) => {
        try {
            const data = await driveApi.getDownloadUrl(item.id);
            if (!data.success || !data.url) {
                throw new Error('Failed to get download URL');
            }
            window.open(data.url, '_blank');
            toast.success('Download started');
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const handleCreateFolder = async (name: string) => {
        if (!name.trim()) {
            toast.error('Please enter a folder name');
            return;
        }

        try {
            setIsCreatingFolder(true);
            const response = await driveApi.createFolder({
                name: name.trim(),
                parentId: currentFolderId
            }) as CreateFolderResponse;

            if (response.success && response.folder) {
                // Ensure the folder has all required properties
                const newFolder: DriveItem = {
                    ...response.folder,
                    type: 'folder',
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                };

                setItems(prev => {
                    // Ensure we don't add duplicates
                    const exists = prev.some(item => item.id === newFolder.id);
                    if (exists) return prev;
                    return [...prev, newFolder];
                });

                setShowCreateFolder(false);
                toast.success('Folder created successfully');
            } else {
                throw new Error(response.message || 'Failed to create folder');
            }
        } catch (error) {
            console.error('Create folder failed:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create folder');
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const handleMoveItem = async (itemId: string, targetFolderId: string) => {
        try {
            const response = await driveApi.moveItem(itemId, targetFolderId);
            if (response.success) {
                setItems(prev => prev.map(item =>
                    item.id === itemId
                        ? { ...item, parentId: targetFolderId }
                        : item
                ));
                return true;
            }
            throw new Error(response.message || 'Failed to move item');
        } catch (error) {
            console.error('Move failed:', error);
            throw error;
        }
    };

    const handleCreateForm = useCallback(async (title: string) => {
        if (!title.trim()) {
            toast.error("Please enter form title");
            return;
        }

        try {
            const response = await driveApi.createForm({
                title: title.trim(),
                parentId: currentFolderId
            });

            if (response.success && response.item) {
                setItems(prev => [...prev, response.item]);
                toast.success("Form created successfully");
                setShowCreateForm(false);
            } else {
                throw new Error(response.message || 'Failed to create form');
            }
        } catch (error) {
            console.error('Create form failed:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create form');
            throw error;
        }
    }, [currentFolderId]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles, currentFolderId]);

    return {
        items,
        loading,
        error,
        selectedFile,
        showCreateForm,
        previewData,
        isPreviewLoading,
        showCreateFolder,
        isCreatingFolder,
        uploadingFiles,
        handleFileClick,
        handleUploadComplete,
        handleDeleteFile,
        handleShare,
        handleDownload,
        setSelectedFile,
        setShowCreateForm,
        setPreviewData,
        loadFiles,
        setShowCreateFolder,
        handleCreateFolder,
        handleMoveItem,
        handleUpload,
        handleCreateForm,
        // Expose share dialog state and methods
        shareDialog,
    };
} 