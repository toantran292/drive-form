'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiFile, FiDownload } from 'react-icons/fi';
import axios from '@/lib/axios';
import { DriveItem } from '@/app/api/drive';
import { formatFileSize } from '@/lib/utils';

interface SharedFileResponse {
    success: boolean;
    file: DriveItem;
    previewUrl?: string;
    downloadUrl?: string;
}

export default function SharedFilePage() {
    const { shareId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileData, setFileData] = useState<SharedFileResponse | null>(null);

    useEffect(() => {
        const loadFile = async () => {
            try {
                setLoading(true);
                const response = await axios.get<SharedFileResponse>(`/drive/share/${shareId}`);
                setFileData(response.data);
            } catch (error: any) {
                setError('Failed to load shared file');
                console.error('Error loading shared file:', error);
            } finally {
                setLoading(false);
            }
        };

        if (shareId) {
            loadFile();
        }
    }, [shareId]);

    const handleDownload = async () => {
        if (!fileData?.downloadUrl) return;
        window.open(fileData.downloadUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !fileData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-2">
                        This file is not available
                    </div>
                    <div className="text-gray-500">
                        The file might be private or no longer exists
                    </div>
                </div>
            </div>
        );
    }

    const { file } = fileData;

    const renderPreview = () => {
        if (!fileData.previewUrl) return null;

        if (file.mimeType?.startsWith('image/')) {
            return (
                <img
                    src={fileData.previewUrl}
                    alt={file.name}
                    className="max-w-full h-auto mx-auto"
                />
            );
        }

        if (file.mimeType === 'application/pdf') {
            return (
                <iframe
                    src={fileData.previewUrl}
                    className="w-full h-[calc(100vh-300px)] min-h-[500px]"
                    title={file.name}
                />
            );
        }

        return (
            <div className="text-center py-12">
                <FiFile size={48} className="mx-auto mb-4 text-gray-400" />
                <div className="text-gray-500">
                    This file type cannot be previewed
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {file.name}
                                </h1>
                                <div className="mt-1 text-sm text-gray-500">
                                    {formatFileSize(file.size || 0)} •
                                    Shared {new Date(file.modifiedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FiDownload className="mr-2" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-6">
                        {renderPreview()}
                    </div>
                </div>
            </div>
        </div>
    );
} 