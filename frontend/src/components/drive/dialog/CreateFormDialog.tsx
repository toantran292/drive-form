'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDrive } from '@/contexts/DriveContext';
import axiosInstance from "@/lib/axios";
import {useAuth} from "@/contexts/AuthContext";
import {toast} from "sonner";

interface CreateFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    phaseId?: string;
}

export function CreateFormDialog({ isOpen, onClose,phaseId }: CreateFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const { handleCreateForm } = useDrive();
    const { user } = useAuth()

    const generatePhaseCode = () => {
        const now = new Date();
        const dateStr = `${now.getFullYear()}${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now
            .getHours()
            .toString()
            .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
        const emailPrefix = user?.email || "unknown";
        return `${dateStr}-${emailPrefix}`;
    };
    const [title, setTitle] = useState(generatePhaseCode());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (phaseId) {
                // Gọi API tạo form theo phase
                await axiosInstance.post(`/phases/${phaseId}/forms`, {
                    title,
                })
            } else {
                // Gọi API mặc định qua DriveContext
                await handleCreateForm(title);
            }
            onClose();
            toast.success("Biểu mẫu đã được tạo thành công.");
            setTitle(""); // Reset form
        } catch (error) {
            // Error already handled in hook
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo biểu mẫu mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Nhập tiêu đề biểu mẫu"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Đóng
                        </Button>
                        <Button type="submit" loading={loading}>
                            Tạo
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 