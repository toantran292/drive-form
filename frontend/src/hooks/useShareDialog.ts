import { useState, useEffect } from 'react';
import * as driveApi from '@/app/api/drive';
import { toast } from 'sonner';

interface UseShareDialogProps {
    onClose?: () => void;
}

export function useShareDialog({ onClose }: UseShareDialogProps = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [emails, setEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareLink, setShareLink] = useState<string>('');
    const [currentFile, setCurrentFile] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (isOpen && currentFile) {
            loadShareInfo(currentFile.id);
        }
    }, [isOpen, currentFile]);

    const loadShareInfo = async (fileId: string) => {
        try {
            setLoading(true);
            const response = await driveApi.getShareInfo(fileId);
            setIsPublic(response.isPublic);
            setEmails(response.sharedWith);
            if (response.shareLink) {
                setShareLink(response.shareLink);
            }
        } catch (error) {
            setError('Failed to load sharing information');
            console.error('Error loading share info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!currentFile) return;

        try {
            setLoading(true);
            setError(null);

            console.log({ emails })

            const response = await driveApi.shareFile(currentFile.id, {
                emails: emails.length > 0 ? emails : [],
                isPublic
            });

            if (response.success) {
                setShareLink(response.shareLink);
            }
        } catch (error) {
            setError('Failed to share file. Please try again.');
            console.error('Share error:', error);
        } finally {
            setLoading(false);
            loadShareInfo(currentFile.id);
        }
    };

    const handleAddEmail = async (email: string) => {
        if (!email || emails.includes(email)) return;

        setEmails(prev => [...prev, email]);
        setNewEmail('');
    };

    const handleRemoveEmail = async (email: string) => {
        setEmails(emails => emails.filter(e => e !== email));
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset state khi đóng dialog
            setCurrentFile(null);
            setEmails([]);
            setNewEmail('');
            setIsPublic(false);
            setError(null);
            setShareLink('');
            if (onClose) onClose();
        }
    };

    const openShare = (file: { id: string; name: string }) => {
        setCurrentFile(file);
        setIsOpen(true);
    };

    return {
        isOpen,
        emails,
        newEmail,
        isPublic,
        error,
        loading,
        copied,
        shareLink,
        currentFile,
        setNewEmail,
        setIsPublic,
        handleOpenChange,
        handleSubmit,
        handleCopyLink: () => {
            if (!shareLink) return;
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        },
        handleAddEmail,
        handleRemoveEmail,
        openShare,
    };
} 