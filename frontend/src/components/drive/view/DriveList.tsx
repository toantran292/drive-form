import { DriveItem } from '@/app/api/drive';
import { FileIcon } from '../FileIcon';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { FiArrowDown, FiMoreVertical } from 'react-icons/fi';

interface DriveListProps {
    items: DriveItem[];
    onFileClick: (item: DriveItem) => void;
    onDelete: (item: DriveItem) => void;
    onShare: (item: DriveItem) => void;
    onDownload: (item: DriveItem) => void;
    onRename: (item: DriveItem) => void;
    onDrop: (e: React.DragEvent, targetId: string) => void;
}

export function DriveList({ items, onFileClick, onDelete, onShare, onDownload, onRename, onDrop }: DriveListProps) {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="grid grid-cols-[4fr,2fr,2fr,1fr,40px] gap-2 px-4 py-2 text-sm text-gray-600 border-b sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                    <span>Tên</span>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                        <FiArrowDown className="w-3 h-3" />
                    </button>
                </div>
                <div>Chủ sở hữu</div>
                <div>Sửa đổi lần cuối</div>
                <div>Kích cỡ tệp</div>
                <div></div> {/* For actions menu */}
            </div>

            {/* Items */}
            <div>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-[4fr,2fr,2fr,1fr,40px] gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b"
                        onClick={() => onFileClick(item)}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify(item));
                        }}
                        onDragOver={(e) => {
                            if (item.type === 'folder') {
                                e.preventDefault();
                                e.currentTarget.classList.add('bg-blue-50');
                            }
                        }}
                        onDragLeave={(e) => {
                            e.currentTarget.classList.remove('bg-blue-50');
                        }}
                        onDrop={(e) => {
                            e.currentTarget.classList.remove('bg-blue-50');
                            if (item.type === 'folder') {
                                onDrop(e, item.id);
                            }
                        }}
                    >
                        {/* Name column */}
                        <div className="flex items-center gap-3">
                            <FileIcon type={item.type} mimeType={item.mimeType} className="w-5 h-5" />
                            <span className="truncate">{item.name}</span>
                        </div>

                        {/* Owner column */}
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                {item.owner?.name?.[0] || 'U'}
                            </div>
                            <span className="truncate">tôi</span>
                        </div>

                        {/* Last modified column */}
                        <div className="flex items-center">
                            {formatDate(item.modifiedAt)}
                        </div>

                        {/* File size column */}
                        <div className="flex items-center">
                            {item.type === 'folder' ? '—' : formatFileSize(item.size)}
                        </div>

                        {/* Actions menu */}
                        <div className="flex items-center justify-end">
                            <button
                                className="p-1.5 hover:bg-gray-100 rounded-full invisible group-hover:visible"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Show context menu
                                }}
                            >
                                <FiMoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

