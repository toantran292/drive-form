'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiFile, FiFolder } from 'react-icons/fi';
import * as driveApi from '@/app/api/drive';
import { formatFileSize } from '@/lib/utils';
import FileViewer from '@/components/drive/FileViewer';
import SharedLayout from '@/components/drive/layout/SharedLayout';

export default function SharedFilesPage() {
    const [files, setFiles] = useState<driveApi.DriveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<driveApi.DriveItem | null>(null);

    useEffect(() => {
        loadSharedFiles();
    }, []);

    const loadSharedFiles = async () => {
        try {
            setLoading(true);
            const files = await driveApi.getSharedFiles();
            setFiles(files);
        } catch (error) {
            setError('Failed to load shared files. Please try again.');
            console.error('Error loading shared files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = (file: driveApi.DriveItem) => {
        if (file.type === 'file') {
            setSelectedFile(file);
        }
    };

    const renderContent = useCallback(({ view }: { view: 'grid' | 'list' }) => (
        <div className="flex-1 p-6">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            <h1 className="text-2xl font-semibold mb-6">Shared with me</h1>

            {files.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                    No files have been shared with you yet.
                </div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="relative p-4 border rounded-lg hover:bg-gray-100 cursor-pointer group flex flex-col transition-colors"
                            onClick={() => handleFileClick(file)}
                        >
                            <div className="flex items-center mb-2">
                                <div className="flex-1">
                                    {file.type === 'folder' ? (
                                        <FiFolder size={40} className="text-blue-500" />
                                    ) : (
                                        <FiFile size={40} className="text-gray-500" />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="font-medium truncate mb-1 group-hover:text-gray-900">
                                    {file.name}
                                </div>
                                <div className="text-sm text-gray-500 group-hover:text-gray-700 mt-auto">
                                    <div>Modified {new Date(file.modifiedAt).toLocaleDateString()}</div>
                                    {file.size && <div>{formatFileSize(file.size)}</div>}
                                    <div className="text-blue-500">
                                        Shared by {file.ownerId}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="pb-3 pl-4">Name</th>
                            <th className="pb-3">Modified</th>
                            <th className="pb-3">Size</th>
                            <th className="pb-3">Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr
                                key={file.id}
                                className="hover:bg-gray-100 cursor-pointer group transition-colors"
                                onClick={() => handleFileClick(file)}
                            >
                                <td className="py-3 pl-4">
                                    <div className="flex items-center">
                                        {file.type === 'folder' ? (
                                            <FiFolder className="text-blue-500 mr-2" size={20} />
                                        ) : (
                                            <FiFile className="text-gray-500 mr-2" size={20} />
                                        )}
                                        <span className="truncate group-hover:text-gray-900">{file.name}</span>
                                    </div>
                                </td>
                                <td className="group-hover:text-gray-900">
                                    {new Date(file.modifiedAt).toLocaleDateString()}
                                </td>
                                <td className="group-hover:text-gray-900">
                                    {file.size ? formatFileSize(file.size) : '--'}
                                </td>
                                <td className="text-blue-500 group-hover:text-blue-600">
                                    {file.ownerId}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {selectedFile && (
                <FileViewer
                    fileId={selectedFile.id}
                    mimeType={selectedFile.mimeType || ''}
                    name={selectedFile.name}
                    open={!!selectedFile}
                    onOpenChange={() => setSelectedFile(null)}
                />
            )}
        </div>
    ), [files, error, selectedFile]);

    if (loading) {
        return (
            <SharedLayout>
                <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </SharedLayout>
        );
    }

    return (
        <SharedLayout>
            {renderContent}
        </SharedLayout>
    );
} 