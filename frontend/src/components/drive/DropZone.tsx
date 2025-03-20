'use client';

import { useState, useCallback } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { getUploadUrl, saveFile, uploadFileToStorage } from '@/app/api/drive';
import { DriveItem } from '@/app/api/drive';
import { toast } from 'sonner';

interface DropZoneProps {
    onUploadComplete?: (file: DriveItem) => void;
    onUploadError?: (error: Error) => void;
    parentId?: string;
}

export default function DropZone({ onUploadComplete, onUploadError, parentId }: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<{ [key: string]: number }>({});

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const uploadSingleFile = async (file: File) => {
        try {
            // 1. Lấy signed URL để upload
            const { url, path } = await getUploadUrl({
                fieldname: 'file',
                originalname: file.name,
                mimetype: file.type,
                size: file.size,
                encoding: '7bit',
                buffer: null
            }, parentId);

            // 2. Upload file lên storage
            await uploadFileToStorage(url, file);

            // 3. Lưu thông tin file vào database
            const { file: savedFile } = await saveFile({
                fieldname: 'file',
                originalname: file.name,
                mimetype: file.type,
                size: file.size,
                encoding: '7bit',
                storagePath: path
            }, parentId);

            return savedFile;
        } catch (error) {
            throw error;
        }
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const uploadPromises = files.map(async (file) => {
            try {
                setProgress(prev => ({ ...prev, [file.name]: 0 }));
                const uploadedFile = await uploadSingleFile(file);
                setProgress(prev => ({ ...prev, [file.name]: 100 }));
                onUploadComplete?.(uploadedFile);
                toast.success(`${file.name} uploaded successfully`);
                return uploadedFile;
            } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
                onUploadError?.(error as Error);
                throw error;
            }
        });

        try {
            await Promise.all(uploadPromises);
        } finally {
            setIsUploading(false);
            setProgress({});
        }
    }, [onUploadComplete, onUploadError, parentId]);

    const renderProgress = () => {
        if (!isUploading || Object.keys(progress).length === 0) return null;

        return (
            <div className="mt-4 w-full max-w-md">
                {Object.entries(progress).map(([fileName, value]) => (
                    <div key={fileName} className="mb-2">
                        <div className="text-sm text-gray-600 mb-1 truncate">
                            {fileName}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                border-2 border-dashed rounded-lg p-8
                flex flex-col items-center justify-center
                transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${isUploading ? 'opacity-90' : 'cursor-pointer'}
            `}
        >
            <FiUploadCloud
                className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
            />
            <p className="mt-2 text-sm text-gray-600">
                {isUploading
                    ? 'Uploading files...'
                    : 'Drag and drop files here'}
            </p>
            {renderProgress()}
        </div>
    );
} 