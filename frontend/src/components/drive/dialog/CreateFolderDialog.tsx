import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CreateFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => Promise<void>;
    isLoading: boolean;
}

export function CreateFolderDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading
}: CreateFolderDialogProps) {
    const [folderName, setFolderName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onConfirm(folderName);
        setFolderName('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo thư mục mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <Input
                            placeholder="Nhập tên thư mục"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Đóng
                        </Button>
                        <Button
                            type="submit"
                            disabled={!folderName.trim() || isLoading}
                            loading={isLoading}
                        >
                            Tạo
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 