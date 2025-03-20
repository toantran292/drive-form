'use client';

import { useEffect, useRef } from 'react';
import { FiShare2, FiTrash2, FiDownload, FiFileText } from 'react-icons/fi';

interface Position {
    x: number;
    y: number;
}

interface ContextMenuProps {
    position: Position;
    onClose: () => void;
    type: 'item' | 'background';
    onShare?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
    onCreateForm: () => void;
}

export default function ContextMenu({
    position,
    onClose,
    type,
    onShare,
    onDelete,
    onDownload,
    onCreateForm
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Điều chỉnh vị trí nếu menu bị tràn ra ngoài viewport
    useEffect(() => {
        if (!menuRef.current) return;

        const rect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (rect.right > viewportWidth) {
            menuRef.current.style.left = `${viewportWidth - rect.width - 10}px`;
        }
        if (rect.bottom > viewportHeight) {
            menuRef.current.style.top = `${viewportHeight - rect.height - 10}px`;
        }
    }, [position]);

    return (
        <div
            ref={menuRef}
            className="fixed bg-white rounded-lg shadow-lg py-1 z-50 min-w-[180px]"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`
            }}
        >
            {type === 'item' ? (
                <>
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100 text-gray-700"
                        >
                            <FiDownload className="mr-2" />
                            Download
                        </button>
                    )}
                    {onShare && (
                        <button
                            onClick={onShare}
                            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100 text-gray-700"
                        >
                            <FiShare2 className="mr-2" />
                            Share
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100 text-red-600"
                        >
                            <FiTrash2 className="mr-2" />
                            Delete
                        </button>
                    )}
                </>
            ) : (
                <button
                    onClick={onCreateForm}
                    className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100 text-gray-700"
                >
                    <FiFileText className="mr-2" />
                    Create Form
                </button>
            )}
        </div>
    );
} 