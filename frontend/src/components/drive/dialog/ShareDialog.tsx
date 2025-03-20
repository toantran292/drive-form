'use client';

import { useRef, useEffect } from 'react';
import { FiGlobe, FiMail, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useDrive } from '@/contexts/DriveContext';

interface ShareDialogProps {
    fileId: string;
    fileName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ fileId, fileName, open, onOpenChange }: ShareDialogProps) {
    const {
        shareEmails,
        shareNewEmail,
        setShareNewEmail,
        shareIsPublic,
        setShareIsPublic,
        shareError,
        shareLoading,
        shareCopied,
        shareLink,
        handleShareSubmit,
        handleCopyShareLink,
        handleAddShareEmail,
        handleRemoveShareEmail,
    } = useDrive();

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share "{fileName}"</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {shareLoading && (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {!shareLoading && (
                        <>
                            <div className="mb-6">
                                <label className="flex items-center space-x-2 text-gray-700 mb-2">
                                    <FiGlobe className="h-4 w-4" />
                                    <span>Public Access</span>
                                </label>
                                <div className="flex items-center mb-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={shareIsPublic}
                                            onChange={(e) => setShareIsPublic(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                    <span className="ml-3 text-sm text-gray-600">
                                        {shareIsPublic ? 'Anyone with the link can view' : 'Only specific people can view'}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center space-x-2 text-gray-700 mb-2">
                                    <FiMail className="h-4 w-4" />
                                    <span>Share with specific people</span>
                                </label>
                                <div className="flex space-x-2 mb-2">
                                    <input
                                        type="email"
                                        value={shareNewEmail}
                                        onChange={(e) => setShareNewEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddShareEmail(shareNewEmail)}
                                    />
                                    <button
                                        onClick={() => handleAddShareEmail(shareNewEmail)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {shareEmails.map((email) => (
                                        <div
                                            key={email}
                                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                                        >
                                            <span className="text-gray-700">{email}</span>
                                            <button
                                                onClick={() => handleRemoveShareEmail(fileId, email)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FiX className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {shareError && (
                                <div className="mb-4 text-red-600 text-sm">{shareError}</div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <button
                        onClick={handleCopyShareLink}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900 flex items-center gap-2"
                        title={shareCopied ? 'Copied!' : 'Copy link'}
                    >
                        Copy link
                        {shareCopied ? <FiCheck className="h-4 w-4 text-green-500" /> : <FiCopy className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => {
                            handleShareSubmit(fileId);
                        }}
                        disabled={shareLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {shareLoading ? 'Saving...' : 'Save'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 