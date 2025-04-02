'use client';

import { FiFolder, FiGrid, FiList } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { BackgroundContextMenu } from './context-menu/BackgroundContextMenu';
import { DriveGrid } from './view/DriveGrid';
import { DriveList } from './view/DriveList';
import FileViewer from './FileViewer';
import ShareDialog from './dialog/ShareDialog';
import { CreateFormDialog } from './dialog/CreateFormDialog';
import { CreateFolderDialog } from './dialog/CreateFolderDialog';
import { useDrive } from '@/contexts/DriveContext';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb } from './Breadcrumb';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { DriveItem } from '@/app/api/drive';

interface DriveContentProps {
    view: 'grid' | 'list';
}

const sortAndGroupItems = (items: DriveItem[]) => {
    const folders = items
        .filter(item => item.type === 'folder')
        .sort((a, b) => a.name.localeCompare(b.name));

    const files = items
        .filter(item => item.type !== 'folder')
        .sort((a, b) => a.name.localeCompare(b.name));

    return { folders, files };
};

export default function DriveContent({ view: initialView }: DriveContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get('folderId') || undefined;
    const [view, setView] = useState(initialView);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isDragging, setIsDragging] = useState(false);
    const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

    const {
        items,
        loading,
        selectedFile,
        showCreateForm,
        showCreateFolder,
        previewData,
        isPreviewLoading,
        isCreatingFolder,
        uploadingFiles,
        handleFileClick: onFileClick,
        handleUpload,
        handleDeleteFile,
        handleShare,
        handleDownload,
        handleCreateFolder,
        handleMoveItem,
        setSelectedFile,
        setShowCreateForm,
        setShowCreateFolder,
        setPreviewData,
        loadFiles,
        shareDialog,
        currentFile,
        shareDialogOpen,
        setShareDialogOpen,
    } = useDrive();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, targetFolderId?: string) => {
        e.preventDefault();
        setIsDragging(false);

        // Handle files from external sources
        if (e.dataTransfer.files.length > 0) {
            try {
                for (const file of e.dataTransfer.files) {
                    await handleUpload(file);
                }
                toast.success('Tải tệp thành công');
                // toast.success('Files uploaded successfully');
                loadFiles();
            } catch (error) {
                toast.error('Tải tệp thất bại');
                // toast.error('Failed to upload files');
            }
            return;
        }

        // Handle internal drag & drop
        try {
            const itemData = e.dataTransfer.getData('text/plain');
            if (!itemData) return;

            const item = JSON.parse(itemData) as DriveItem;
            if (!targetFolderId || item.id === targetFolderId || item.parentId === targetFolderId) {
                return;
            }

            await handleMoveItem(item.id, targetFolderId);
            toast.success(`Di chuyển ${item.name} thành công`);
            loadFiles();
        } catch (error) {
            toast.error('Di chuyển thất bại');
        }
    }, [currentFolderId, handleMoveItem, handleUpload, loadFiles]);

    const handleUploadClick = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf';
        input.multiple = false;

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                await handleUpload(file);
            } catch (error) {
                console.error('Upload failed:', error);
            }
        };

        input.click();
    }, [handleUpload]);

    const handleFileViewerClose = useCallback(() => {
        setIsFileViewerOpen(false);
        setSelectedFile(null);
        setPreviewData(null);
    }, [setSelectedFile, setPreviewData]);

    const handleFileClick = useCallback((file: DriveItem) => {
        if (file.type === 'file') {
            setIsFileViewerOpen(true);
        }
        onFileClick(file);
    }, [router, onFileClick]);

    const { folders, files } = sortAndGroupItems(items);

    if (loading) {
        return (
            <div className="flex-1 p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <header className="border-b px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold">Drive</h1>
                    <Breadcrumb currentFolderId={currentFolderId} />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('grid')}
                        className={view === 'grid' ? 'bg-gray-100' : ''}
                    >
                        <FiGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('list')}
                        className={view === 'list' ? 'bg-gray-100' : ''}
                    >
                        <FiList className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <BackgroundContextMenu
                onUpload={handleUploadClick}
                onCreateForm={() => setShowCreateForm(true)}
                onCreateFolder={() => setShowCreateFolder(true)}
            >
                <div
                    className={cn(
                        "flex-1 overflow-auto relative",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, currentFolderId)}
                >
                    <div className="p-6 space-y-6">
                        {/* Action Buttons */}

                        {Object.entries(uploadingFiles).map(([id, file]) => (
                            <div key={id} className="bg-white p-3 rounded-lg border space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium truncate">{file.name}</span>
                                    <span className="text-gray-500">{Math.round(file.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${file.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Content */}
                        {items.length === 0 ? (
                            <div className="text-center text-gray-500 mt-20">
                                <FiFolder className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>Chưa có tệp hoặc thư mục. Tải lên một cái gì đó!</p>
                            </div>
                        ) : view === 'grid' ? (
                            <div className="space-y-8">
                                {folders.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-medium text-gray-500 mb-4">Folders</h2>
                                        <DriveGrid
                                            items={folders}
                                            onFileClick={handleFileClick}
                                            onDrop={handleDrop}
                                            onDelete={handleDeleteFile}
                                            onShare={handleShare}
                                            onDownload={handleDownload}
                                            onRename={() => toast.info('Rename coming soon')}
                                        />
                                    </div>
                                )}
                                {files.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-medium text-gray-500 mb-4">Files</h2>
                                        <DriveGrid
                                            items={files}
                                            onFileClick={handleFileClick}
                                            onDrop={handleDrop}
                                            onDelete={handleDeleteFile}
                                            onShare={handleShare}
                                            onDownload={handleDownload}
                                            onRename={() => toast.info('Rename coming soon')}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {folders.length > 0 && (
                                    <div>
                                        <h2 className="font-medium mb-2">Folders</h2>
                                        <DriveList
                                            items={folders}
                                            onFileClick={handleFileClick}
                                            onDelete={handleDeleteFile}
                                            onShare={handleShare}
                                            onDownload={handleDownload}
                                            onRename={() => toast.info('Rename coming soon')}
                                            onDrop={handleDrop}
                                        />
                                    </div>
                                )}
                                {files.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-medium text-gray-500 mb-4">Files</h2>
                                        <DriveList
                                            items={files}
                                            onFileClick={handleFileClick}
                                            onDelete={handleDeleteFile}
                                            onShare={handleShare}
                                            onDownload={handleDownload}
                                            onRename={() => toast.info('Rename coming soon')}
                                            onDrop={handleDrop}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </BackgroundContextMenu>
            {/* Modals */}
            {selectedFile && (
                <FileViewer
                    fileId={selectedFile.id}
                    mimeType={selectedFile.mimeType || ''}
                    name={selectedFile.name}
                    open={isFileViewerOpen}
                    onOpenChange={(open) => {
                        setIsFileViewerOpen(open);
                        if (!open) {
                            handleFileViewerClose();
                        }
                    }}
                    previewUrl={previewData?.signedUrl}
                    isInitialLoading={isPreviewLoading}
                />
            )}

            {/* Share Dialog */}
            {currentFile && (
                <ShareDialog
                    fileId={currentFile.id}
                    fileName={currentFile.name}
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                />
            )}

            <CreateFormDialog
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
            />
            <CreateFolderDialog
                isOpen={showCreateFolder}
                onClose={() => setShowCreateFolder(false)}
                onConfirm={handleCreateFolder}
                isLoading={isCreatingFolder}
            />
        </div>
    );
} 