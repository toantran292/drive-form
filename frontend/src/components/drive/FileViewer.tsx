'use client';

import { useState, useEffect, useRef } from 'react';
import { FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import axiosInstance from '@/lib/axios';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface FileViewerProps {
    fileId: string;
    mimeType: string;
    name: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewUrl?: string;
    isInitialLoading?: boolean;
}

export default function FileViewer({
    fileId,
    mimeType,
    name,
    open,
    onOpenChange,
    previewUrl,
    isInitialLoading = false
}: FileViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const fileDataRef = useRef<{ blob: Blob, url: string } | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!previewUrl) return;

        const fetchFile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setDownloadProgress(0);

                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                abortControllerRef.current = new AbortController();

                const response = await axiosInstance.get(previewUrl, {
                    responseType: 'blob',
                    signal: abortControllerRef.current.signal,
                    timeout: 30000, // 30 giây timeout
                    onDownloadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setDownloadProgress(percentCompleted);
                        }
                    }
                });

                const blob = new Blob([response.data], { type: mimeType });
                const url = URL.createObjectURL(blob);
                fileDataRef.current = { blob, url };

                if (mimeType === 'application/pdf') {
                    setPdfBlob(blob);
                } else {
                    setFileUrl(url);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message = error.response?.data?.message ||
                        error.message ||
                        'Failed to load file';
                    setError(message);
                    toast.error(message);
                } else if (error instanceof Error && error.name !== 'AbortError') {
                    setError(error.message);
                    toast.error(error.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchFile();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
            if (fileDataRef.current?.url) {
                URL.revokeObjectURL(fileDataRef.current.url);
            }
        };
    }, [fileId, mimeType, previewUrl]);

    const handleDownload = () => {
        try {
            if (!fileDataRef.current) {
                throw new Error("File data not available");
            }

            const link = document.createElement('a');
            link.href = fileDataRef.current.url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Download started');
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const handlePageChange = (newPage: number) => {
        if (numPages && newPage >= 1 && newPage <= numPages) {
            setCurrentPage(newPage);
        }
    };

    const handleZoom = (delta: number) => {
        setScale(prevScale => {
            const newScale = prevScale + delta;
            return Math.min(Math.max(0.5, newScale), 2); // Giới hạn scale từ 0.5 đến 2
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full flex flex-col min-w-[90vw]">
                <DialogHeader className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            {name}
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDownload}
                            title="Download file"
                        >
                            <FiDownload size={20} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-4 bg-gray-50 relative">
                    {error ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="text-red-700 font-medium mb-4">{error}</div>
                            <Button
                                variant="default"
                                onClick={() => window.open(previewUrl, '_blank')}
                            >
                                Open in new tab
                            </Button>
                        </div>
                    ) : (
                        <>
                            {(isInitialLoading || isLoading) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
                                    <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {isInitialLoading ? 'Preparing preview...' : `Loading... ${downloadProgress}%`}
                                    </div>
                                </div>
                            )}
                            {mimeType.startsWith('image/') ? (
                                fileUrl ? (
                                    <img
                                        src={fileUrl}
                                        alt={name}
                                        className="max-w-full h-auto mx-auto shadow-lg"
                                        onError={() => setError('Failed to load image')}
                                        onLoad={() => setIsLoading(false)}
                                    />
                                ) : null
                            ) : mimeType === 'application/pdf' && pdfBlob ? (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-center items-center space-x-4 mb-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleZoom(-0.1)}
                                        >
                                            -
                                        </Button>
                                        <span>{Math.round(scale * 100)}%</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleZoom(0.1)}
                                        >
                                            +
                                        </Button>
                                        {numPages && (
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage <= 1}
                                                >
                                                    <FiChevronLeft size={20} />
                                                </Button>
                                                <span>
                                                    Page {currentPage} of {numPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage >= (numPages || 1)}
                                                >
                                                    <FiChevronRight size={20} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-auto flex justify-center">
                                        <Document
                                            file={pdfBlob}
                                            onLoadSuccess={({ numPages }) => {
                                                setNumPages(numPages);
                                                setIsLoading(false);
                                            }}
                                            onLoadError={() => setError('Failed to load PDF')}
                                            className="bg-white shadow-lg rounded-lg p-4"
                                        >
                                            <Page
                                                pageNumber={currentPage}
                                                scale={scale}
                                                renderTextLayer={true}
                                                renderAnnotationLayer={true}
                                            />
                                        </Document>
                                    </div>
                                </div>
                            ) : fileUrl ? (
                                <iframe
                                    src={fileUrl}
                                    className="w-full h-full border-0 bg-white shadow-lg rounded-lg"
                                    onError={() => setError('Failed to load preview')}
                                    onLoad={() => setIsLoading(false)}
                                    title={name}
                                    sandbox="allow-same-origin allow-scripts allow-popups"
                                />
                            ) : null}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
