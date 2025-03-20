import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { FiDownload, FiShare2, FiTrash2, FiEdit } from 'react-icons/fi';
import { DriveItem } from '@/app/api/drive';

interface DriveItemContextMenuProps {
    children: React.ReactNode;
    item: DriveItem;
    onDelete: (item: DriveItem) => void;
    onShare: (item: DriveItem) => void;
    onDownload: (item: DriveItem) => void;
    onRename: (item: DriveItem) => void;
}

export function DriveItemContextMenu({
    children,
    item,
    onDelete,
    onShare,
    onDownload,
    onRename,
}: DriveItemContextMenuProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                {item.type === 'file' ? (
                    <>
                        <ContextMenuItem
                            onClick={() => onDownload(item)}
                            className="flex items-center gap-2"
                        >
                            <FiDownload className="h-4 w-4" />
                            <span>Download</span>
                        </ContextMenuItem>
                    </>
                ) : null}

                {item.type !== 'form' ? (
                    <ContextMenuItem
                        onClick={() => onShare(item)}
                        className="flex items-center gap-2"
                    >
                        <FiShare2 className="h-4 w-4" />
                        <span>Share</span>
                    </ContextMenuItem>
                ) : null}

                <ContextMenuItem
                    onClick={() => onRename(item)}
                    className="flex items-center gap-2"
                >
                    <FiEdit className="h-4 w-4" />
                    <span>Rename</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={() => onDelete(item)}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                    <FiTrash2 className="h-4 w-4" />
                    <span>Delete</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu >
    );
} 