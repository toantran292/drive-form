'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDrive } from '@/contexts/DriveContext';

interface CreateFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateFormDialog({ isOpen, onClose }: CreateFormDialogProps) {
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const { handleCreateForm } = useDrive();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await handleCreateForm(title);
            onClose();
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
                    <DialogTitle>Create New Form</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Enter form title"
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
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 