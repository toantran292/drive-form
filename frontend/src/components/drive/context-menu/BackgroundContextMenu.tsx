import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { FiUpload, FiFileText, FiFolder } from 'react-icons/fi';
import { PropsWithChildren } from "react";

interface BackgroundContextMenuProps extends PropsWithChildren {
    onUpload: () => void;
    onCreateForm: () => void;
    onCreateFolder: () => void;
}

export function BackgroundContextMenu({
    children,
    onUpload,
    onCreateForm,
    onCreateFolder,
}: BackgroundContextMenuProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger className="w-full h-full">
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                <ContextMenuItem
                    onClick={onUpload}
                    className="flex items-center gap-2"
                >
                    <FiUpload className="h-4 w-4" />
                    <span>Tải tệp</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={onCreateForm}
                    className="flex items-center gap-2"
                >
                    <FiFileText className="h-4 w-4" />
                    <span>Tạo biểu mẫu</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={onCreateFolder}
                    className="flex items-center gap-2"
                >
                    <FiFolder className="h-4 w-4" />
                    <span>Tạo thư mục</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
} 