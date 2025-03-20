'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FiEye, FiSettings, FiSend, FiStar, FiSave } from 'react-icons/fi'
import { PublishFormDialog } from './PublishFormDialog'
import { FormSettings } from '@/types/form'

interface FormHeaderProps {
    formId: string
    title: string
    settings: FormSettings
    onTitleChange: (title: string) => void
    onUpdateSettings: (settings: Partial<FormSettings>) => Promise<void>
    onSave: () => Promise<void>
    onPublish: () => void
    onUnpublish: () => void
    saving?: boolean
    hasUnsavedChanges?: boolean
}

export function FormHeader({
    formId,
    title,
    settings,
    onTitleChange,
    onUpdateSettings,
    onSave,
    onPublish,
    onUnpublish,
    saving = false,
    hasUnsavedChanges = false
}: FormHeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b bg-white">
            <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Input
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
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
                    <Button variant="ghost" size="sm" disabled={saving}>
                        <FiSettings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                    <Button variant="ghost" size="sm" disabled={saving}>
                        <FiEye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                    <Button disabled={saving}>
                        <FiSend className="h-4 w-4 mr-2" />
                        Send
                    </Button>
                    <PublishFormDialog
                        formId={formId}
                        settings={settings}
                        onUpdateSettings={onUpdateSettings}
                    // onPublish={onPublish}
                    // onUnpublish={onUnpublish}
                    />
                </div>
            </div>
        </header>
    )
} 