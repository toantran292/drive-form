'use client';

import { useState, useEffect, useRef } from 'react';
import { FiDownload, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface ShareFileViewerProps {
    fileId: string;
    mimeType: string;
    name: string;
    onClose: () => void;
    initialPreviewUrl?: string;
}

export default function ShareFileViewer({
    fileId,
    mimeType,
    name,
    onClose,
    initialPreviewUrl
}: ShareFileViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const fetchPreviewUrl = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                abortControllerRef.current = new AbortController();

                if (!initialPreviewUrl) {
                    throw new Error('Preview URL is required');
                }

                if (mimeType === 'application/pdf') {
                    const proxyUrl = `/api/proxy?url=${encodeURIComponent(initialPreviewUrl)}`;
                    const response = await fetch(proxyUrl, {
                        signal: abortControllerRef.current.signal
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch PDF');
                    }

                    const blob = await response.blob();
                    setPdfBlob(blob);
                } else {
                    setPreviewUrl(initialPreviewUrl);
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return;
                }
                console.error('Preview failed:', error);
                setError(error.message || 'Failed to load preview');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreviewUrl();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [mimeType, initialPreviewUrl]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setScale(1);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPageNumber = prevPageNumber + offset;
            return Math.min(Math.max(1, newPageNumber), numPages || 1);
        });
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 backdrop-blur-sm"></div>

            {/* Content container */}
            <div className="relative w-11/12 h-5/6 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="absolute top-4 right-4 z-10 flex items-center space-x-4">
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all duration-200 backdrop-blur-sm"
                        title="Close preview"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Main content */}
                <div className="h-full w-full flex items-center justify-center p-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                            <div className="text-white text-lg">Loading...</div>
                        </div>
                    )}

                    {error && (
                        <div className="text-white text-lg font-medium bg-red-500/20 px-6 py-3 rounded-lg backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && (
                        mimeType.startsWith('image/') ? (
                            <img
                                src={previewUrl!}
                                alt={name}
                                className="max-w-full max-h-full object-contain rounded-lg"
                                onError={() => setError('Failed to load image')}
                            />
                        ) : mimeType === 'application/pdf' && pdfBlob ? (
                            <div className="h-full w-full flex flex-col items-center">
                                <div className="flex-1 w-full max-h-[calc(100%-5rem)] overflow-auto bg-white/5 rounded-xl p-4">
                                    <Document
                                        file={pdfBlob}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        onLoadError={() => setError('Failed to load PDF')}
                                        className="flex justify-center"
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            scale={scale}
                                            className="shadow-xl bg-white rounded-lg"
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                        />
                                    </Document>
                                </div>
                                {numPages && (
                                    <div className="flex items-center justify-center mt-4">
                                        <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-xl p-1.5">
                                            <button
                                                onClick={previousPage}
                                                disabled={pageNumber <= 1}
                                                className="px-4 py-1.5 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-sm font-medium"
                                            >
                                                Previous
                                            </button>

                                            <div className="px-3 py-1.5 text-white font-medium text-sm">
                                                {pageNumber} / {numPages}
                                            </div>

                                            <button
                                                onClick={nextPage}
                                                disabled={pageNumber >= (numPages || 1)}
                                                className="px-4 py-1.5 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-sm font-medium"
                                            >
                                                Next
                                            </button>

                                            <div className="w-px h-5 bg-white/20 mx-1" />

                                            <button
                                                onClick={zoomOut}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                                                title="Zoom out"
                                            >
                                                <FiZoomOut size={18} />
                                            </button>

                                            <div className="text-white text-sm font-medium min-w-[3rem] text-center">
                                                {Math.round(scale * 100)}%
                                            </div>

                                            <button
                                                onClick={zoomIn}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                                                title="Zoom in"
                                            >
                                                <FiZoomIn size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <iframe
                                src={previewUrl!}
                                className="w-full h-full rounded-lg bg-white"
                                onError={() => setError('Failed to load preview')}
                                title={name}
                                sandbox="allow-same-origin allow-scripts allow-popups"
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
} 