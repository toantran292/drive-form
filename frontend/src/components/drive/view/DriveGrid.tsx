import { DriveItem } from '@/app/api/drive';
import { FileIcon } from '../FileIcon';
import { formatFileSize, cn, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../../ui/context-menu';
import { FiUpload } from 'react-icons/fi';
import { DriveItemContextMenu } from '../context-menu/DriveItemContextMenu';

interface DriveGridProps {
    items: DriveItem[];
    onFileClick: (item: DriveItem) => void;
    onDrop: (e: React.DragEvent, targetFolderId?: string) => void;
    onDelete: (item: DriveItem) => void;
    onShare: (item: DriveItem) => void;
    onDownload: (item: DriveItem) => void;
    onRename: (item: DriveItem) => void;
}

export function DriveGrid({
    items,
    onFileClick,
    onDrop,
    onDelete,
    onShare,
    onDownload,
    onRename,
}: DriveGridProps) {
    const [draggedOver, setDraggedOver] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, item: DriveItem) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
    };

    const handleDrop = (e: React.DragEvent, targetFolderId?: string) => {
        e.preventDefault();
        onDrop(e, targetFolderId);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
                <DriveItemContextMenu
                    key={item.id}
                    item={item}
                    onDelete={onDelete}
                    onShare={onShare}
                    onDownload={onDownload}
                    onRename={onRename}
                >
                    <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (item.type === 'folder') {
                                setDraggedOver(item.id);
                            }
                        }}
                        onDragLeave={() => setDraggedOver(null)}
                        onDrop={(e) => {
                            handleDrop(e, item.id);
                            setDraggedOver(null);
                        }}
                        className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all",
                            draggedOver === item.id && "bg-blue-50 border-blue-300",
                            "hover:bg-gray-100/50",
                            item.type === 'form' && "hover:border-blue-500",
                            item.type === 'folder' && "hover:border-blue-400"
                        )}
                        onClick={() => onFileClick(item)}

                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-center">
                                <FileIcon
                                    type={item.type}
                                    mimeType={item.mimeType}
                                    size={40}
                                />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="font-medium truncate text-center">
                                    {item.name}
                                </div>
                                <div className="text-sm text-gray-500 text-center">
                                    {item.type === 'folder' ? (
                                        'Folder'
                                    ) : item.type === 'form' ? (
                                        'Form'
                                    ) : (
                                        item.size && formatFileSize(item.size)
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 text-center mt-1">
                                    {formatDate(item.modifiedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </DriveItemContextMenu>
            ))}
        </div>
    );
} 