'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FormEditor } from '@/components/forms/FormEditor'
import { FormHeader } from '@/components/forms/FormHeader'
import { FormSidebar } from '@/components/forms/FormSidebar'
import { getForm, updateForm, Form } from '@/app/api/drive'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import axios from 'axios'
import { FormSettings } from '@/types/form'

export default function FormEditorPage() {
    const router = useRouter()
    const { formId } = useParams()
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState<Form | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    useEffect(() => {
        async function loadForm() {
            try {
                setLoading(true)
                const formData = await getForm(formId as string)
                setForm(formData)
                setError(null)

                // Kiểm tra quyền truy cập
                // if (formData.ownerId !== 'current-user-id' && // Thay thế bằng ID user thực
                //     !formData.sharedWith.some(share =>
                //         share.userId === 'current-user-id' &&
                //         share.permission === 'edit'
                //     )) {
                //     router.push('/drive')
                //     toast.error('You do not have permission to edit this form')
                //     return
                // }

                // // Kiểm tra form có active không
                // if (!formData.isActive) {
                //     toast.error('This form is no longer active')
                // }
            } catch (err) {
                console.error('Failed to load form:', err)
                setError('Failed to load form')
                toast.error('Failed to load form')
            } finally {
                setLoading(false)
            }
        }

        if (formId) {
            loadForm()
        }
    }, [formId, router])

    // Xử lý khi người dùng rời trang mà chưa lưu
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    const saveForm = async (updates: Partial<Form>) => {
        if (!form) return

        try {
            setSaving(true)
            const { form: updatedForm, driveItem } = await updateForm(formId as string, updates)
            setForm(updatedForm)
            setHasUnsavedChanges(false)

            // Nếu title được update, cập nhật lại drive cache
            if (driveItem) {
                // Có thể dispatch một action để update drive state
                // hoặc invalidate drive query cache
                // Ví dụ với React Query:
                // queryClient.invalidateQueries(['drive'])
            }

            toast.success('Form saved successfully')
        } catch (err) {
            console.error('Failed to save form:', err)
            toast.error('Failed to save form')
        } finally {
            setSaving(false)
        }
    }

    // Debounced save function - triggers after 10 seconds of inactivity
    const debouncedSave = useDebouncedCallback(
        (updates: Partial<Form>) => {
            saveForm(updates)
        },
        2500 // 2,5 seconds
    )

    // Handle form updates
    const handleUpdateForm = useCallback((updates: Partial<Form>) => {
        // Update local state immediately
        setForm(prev => prev ? { ...prev, ...updates } : null)
        // Mark as unsaved
        setHasUnsavedChanges(true)
        // Schedule save
        debouncedSave(updates)
    }, [debouncedSave])

    const handleUpdateSettings = async (settings: Partial<FormSettings>) => {
        if (!form) return
        setForm(prev => {
            if (!prev) return null
            const newSettings = { ...prev.settings, ...settings }

            const temp = {
                ...prev,
                settings: newSettings,
                isPublic: (settings.isPublished || settings.allowAnonymous) ?? false
            }
            return temp
        })

        setHasUnsavedChanges(true)
        debouncedSave({ settings })
    }

    // Handle manual save
    const handleManualSave = useCallback(async () => {
        if (!form || !hasUnsavedChanges) return

        // Cancel any pending debounced saves
        debouncedSave.cancel()
        // Save immediately
        await saveForm(form)
    }, [form, hasUnsavedChanges, debouncedSave])

    const handlePublish = async (settings: any) => {
        try {
            const response = await axios.post(`/drive/forms/${formId}/publish`, settings)
            setForm(response.data.form)
            toast.success('Form published successfully')
        } catch (error) {
            toast.error('Failed to publish form')
            throw error
        }
    }

    const handleUnpublish = async () => {
        try {
            const response = await axios.post(`/drive/forms/${formId}/unpublish`)
            setForm(response.data.form)
            toast.success('Form unpublished')
        } catch (error) {
            toast.error('Failed to unpublish form')
            throw error
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        )
    }

    if (error || !form) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">{error || 'Form not found'}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <FormHeader
                formId={formId as string}
                title={form.title}
                settings={form.settings}
                onTitleChange={(newTitle) => handleUpdateForm({ title: newTitle })}
                onSave={handleManualSave}
                onPublish={() => handlePublish(form.settings)}
                onUpdateSettings={handleUpdateSettings}
                onUnpublish={handleUnpublish}
                saving={saving}
                hasUnsavedChanges={hasUnsavedChanges}
            />

            <div className="flex">
                <main className="flex-1 px-4 py-8 mr-80">
                    <FormEditor
                        formId={formId as string}
                        form={form}
                        onChange={(updatedForm) => handleUpdateForm(updatedForm)}
                        saving={saving}
                    />
                </main>

                <FormSidebar
                    formId={formId as string}
                    settings={form.settings}
                    // isActive={form.isActive}
                    // shareId={form.shareId}
                    // sharedWith={form.sharedWith}
                    // responses={form.responses}
                    onSettingsChange={(newSettings) =>
                        handleUpdateForm({ settings: newSettings })
                    }
                    // onActiveChange={(isActive) => handleUpdateForm({ isActive })}
                    saving={saving}
                />
            </div>

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && !saving && (
                <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-lg p-3">
                    <span className="text-sm text-gray-600">Unsaved changes</span>
                    <button
                        onClick={handleManualSave}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Save now
                    </button>
                </div>
            )}
        </div>
    )
} 