import { createContext, useContext, ReactNode } from 'react';
import { useDriveContent } from '@/hooks/useDriveContent';
import { DriveItem } from '@/app/api/drive';

interface DriveContextType {
    items: DriveItem[];
    loading: boolean;
    error: string | null;
    selectedFile: DriveItem | null;
    showCreateForm: boolean;
    showCreateFolder: boolean;
    previewData: { url: string; signedUrl: string } | null;
    isPreviewLoading: boolean;
    isCreatingFolder: boolean;
    uploadingFiles: {
        [key: string]: {
            progress: number;
            name: string;
        }
    };
    handleFileClick: (item: DriveItem) => void;
    handleUpload: (file: File) => Promise<DriveItem | undefined>;
    handleDeleteFile: (file: DriveItem) => Promise<void>;
    handleShare: (item: DriveItem) => void;
    handleDownload: (item: DriveItem) => Promise<void>;
    handleCreateForm: (title: string) => Promise<void>;
    handleCreateFolder: (name: string) => Promise<void>;
    handleMoveItem: (itemId: string, targetFolderId: string) => Promise<boolean>;
    setSelectedFile: (file: DriveItem | null) => void;
    setShowCreateForm: (show: boolean) => void;
    setShowCreateFolder: (show: boolean) => void;
    setPreviewData: (data: { url: string; signedUrl: string } | null) => void;
    loadFiles: () => Promise<void>;
    shareDialogOpen: boolean;
    setShareDialogOpen: (open: boolean) => void;
    shareEmails: string[];
    shareNewEmail: string;
    setShareNewEmail: (email: string) => void;
    shareIsPublic: boolean;
    setShareIsPublic: (isPublic: boolean) => void;
    shareError: string | null;
    shareLoading: boolean;
    shareCopied: boolean;
    shareLink: string;
    handleShareSubmit: (fileId: string) => Promise<void>;
    handleCopyShareLink: () => void;
    handleAddShareEmail: (fileId: string) => Promise<void>;
    handleRemoveShareEmail: (fileId: string, email: string) => Promise<void>;
    currentFileId: string | null;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export function DriveProvider({ children, folderId }: { children: ReactNode; folderId?: string }) {
    const driveContent = useDriveContent(folderId);

    const value = {
        ...driveContent,
        // Expose share dialog methods through context
        shareDialog: driveContent.shareDialog,
        shareDialogOpen: driveContent.shareDialog.isOpen,
        setShareDialogOpen: driveContent.shareDialog.handleOpenChange,
        shareEmails: driveContent.shareDialog.emails,
        shareNewEmail: driveContent.shareDialog.newEmail,
        setShareNewEmail: driveContent.shareDialog.setNewEmail,
        shareIsPublic: driveContent.shareDialog.isPublic,
        setShareIsPublic: driveContent.shareDialog.setIsPublic,
        shareError: driveContent.shareDialog.error,
        shareLoading: driveContent.shareDialog.loading,
        shareCopied: driveContent.shareDialog.copied,
        shareLink: driveContent.shareDialog.shareLink,
        handleShareSubmit: driveContent.shareDialog.handleSubmit,
        handleCopyShareLink: driveContent.shareDialog.handleCopyLink,
        handleAddShareEmail: driveContent.shareDialog.handleAddEmail,
        handleRemoveShareEmail: driveContent.shareDialog.handleRemoveEmail,
        currentFileId: driveContent.shareDialog.currentFile?.id || null,
    };

    return (
        <DriveContext.Provider value={value}>
            {children}
        </DriveContext.Provider>
    );
}

export function useDrive() {
    const context = useContext(DriveContext);
    if (context === undefined) {
        throw new Error('useDrive must be used within a DriveProvider');
    }
    return context;
} 