'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FiSend, FiLink, FiCopy } from 'react-icons/fi'
import { toast } from 'sonner'
import { FormSettings } from '@/types/form'

interface PublishFormDialogProps {
    formId: string
    settings: FormSettings
    onUpdateSettings: (settings: Partial<FormSettings>) => void
}

export function PublishFormDialog({
    formId,
    settings,
    onUpdateSettings
}: PublishFormDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [publishing, setPublishing] = useState(false)

    const handleSettingChange = (key: keyof FormSettings, value: any) => {
        onUpdateSettings({
            ...settings,
            [key]: value
        })
    }

    const handlePublish = async () => {
        try {
            setPublishing(true)
            await onUpdateSettings({
                isPublished: true,
                publishedAt: new Date()
            })
            setIsOpen(false)
            toast.success('Form published successfully')
        } catch (error) {
            toast.error('Failed to publish form')
        } finally {
            setPublishing(false)
        }
    }

    const handleUnpublish = async () => {
        try {
            setPublishing(true)
            await onUpdateSettings({
                isPublished: false,
                publishedAt: undefined
            })
            setIsOpen(false)
            toast.success('Form unpublished')
        } catch (error) {
            toast.error('Failed to unpublish form')
        } finally {
            setPublishing(false)
        }
    }

    const formUrl = `${window.location.origin}/forms/${formId}/view`

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={settings.isPublished ? "outline" : "default"}>
                    <FiSend className="mr-2 h-4 w-4" />
                    {settings.isPublished ? 'Published' : 'Publish'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {settings.isPublished ? 'Form Published' : 'Publish Form'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {settings.isPublished ? (
                        <>
                            <div className="space-y-4">
                                <Label>Share Link</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={formUrl}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            navigator.clipboard.writeText(formUrl)
                                            toast.success('Link copied to clipboard')
                                        }}
                                    >
                                        <FiCopy className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Accept Responses</Label>
                                        <div className="text-sm text-gray-500">
                                            Allow new submissions
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings.acceptingResponses}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange('acceptingResponses', checked)
                                        }
                                    />
                                </div>
                            </div>

                            <Button
                                variant="destructive"
                                onClick={handleUnpublish}
                                disabled={publishing}
                                className="w-full text-white"
                            >
                                Unpublish Form
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Allow Anonymous Responses</Label>
                                        <div className="text-sm text-gray-500">
                                            Let users submit without signing in
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings.allowAnonymous}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange('allowAnonymous', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Collect Email Addresses</Label>
                                        <div className="text-sm text-gray-500">
                                            Require email for submission
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings.collectEmail}
                                        onCheckedChange={(checked) =>
                                            handleSettingChange('collectEmail', checked)
                                        }
                                    />
                                </div>

                                {/* Các settings khác đã được chuyển vào FormSidebar */}
                            </div>

                            <Button
                                onClick={handlePublish}
                                disabled={publishing}
                                className="w-full"
                            >
                                {publishing ? 'Publishing...' : 'Publish Form'}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 