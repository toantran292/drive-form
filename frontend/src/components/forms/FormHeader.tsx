'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiSend, FiStar, FiSave, FiCopy } from 'react-icons/fi'
import { FormSettings } from '@/types/form'
import { memo, useCallback } from 'react'
import { toast } from 'sonner'

interface FormHeaderProps {
    formId: string
    title: string
    settings: FormSettings
    onTitleChange: (title: string) => void
    onUpdateSettings: (settings: Partial<FormSettings>) => void
    onSave: () => Promise<void>
    saving?: boolean
    hasUnsavedChanges?: boolean
}

function FormHeaderComponent({
    formId,
    title,
    settings,
    onTitleChange,
    onUpdateSettings,
    onSave,
    saving = false,
    hasUnsavedChanges = false
}: FormHeaderProps) {

    const handleTogglePublish = useCallback(() => {
        onUpdateSettings({
            ...settings,
            isPublished: !settings.isPublished,
            publishedAt: !settings.isPublished ? new Date() : undefined
        })
    }, [onUpdateSettings, settings])

    const formUrl = `${window.location.origin}/forms/${formId}/view`

    const handleCopyUrl = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(formUrl)
            toast.success('Form URL copied to clipboard')
        } catch (error: unknown) {
            console.error('Failed to copy URL:', error)
            toast.error('Failed to copy URL')
        }
    }, [formUrl])

    return (
        <header className="fixed top-0 z-50 border-b bg-white w-full">
            <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Input
                        defaultValue={title}
                        onBlur={(e) => onTitleChange(e.target.value)}
                        className="h-9 w-64 bg-transparent px-2 text-lg font-medium"
                        placeholder="Untitled form"
                        disabled={saving}
                    />
                    <Button variant="ghost" size="sm">
                        <FiStar className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSave}
                        disabled={saving || !hasUnsavedChanges}
                    >
                        <FiSave className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    {settings.isPublished && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyUrl}
                            className="gap-2"
                        >
                            <FiCopy className="h-4 w-4" />
                            Copy URL
                        </Button>
                    )}
                    <Button variant={settings.isPublished ? "outline" : "default"} onClick={handleTogglePublish}>
                        <FiSend className="mr-2 h-4 w-4" />
                        {settings.isPublished ? 'Published' : 'Publish'}
                    </Button>
                </div>
            </div>
        </header>
    )
}

const FormHeader = memo(FormHeaderComponent)

export { FormHeader }