'use client'

import { useEffect, useState, useCallback, memo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FormEditor } from '@/components/forms/FormEditor'
import { FormHeader } from '@/components/forms/FormHeader'
import { FormSidebar } from '@/components/forms/FormSidebar'
import { getForm, updateForm, Form } from '@/app/api/drive'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import { FormSettings, Question } from '@/types/form'

export default function FormEditorPage() {
    const router = useRouter()
    const { formId } = useParams()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [settings, setSettings] = useState<FormSettings | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [saving, setSaving] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    useEffect(() => {
        async function loadForm() {
            try {
                setLoading(true)
                const formData = await getForm(formId as string)
                setTitle(formData.title)
                setDescription(formData.description || '')
                setSettings(formData.settings)
                setQuestions(formData.questions as Question[])
                setError(null)
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
        try {
            setSaving(true)
            await updateForm(formId as string, updates)
            setHasUnsavedChanges(false)
            toast.success('Form saved successfully')
        } catch (err) {
            console.error('Failed to save form:', err)
            toast.error('Failed to save form')
        } finally {
            setSaving(false)
        }
    }

    // Debounced save function - triggers after 2.5 seconds of inactivity
    const debouncedSave = useDebouncedCallback((updates: Partial<Form>) => {
        saveForm(updates)
    }, 2500)

    // Chỉ cập nhật title
    const handleTitleChange = useCallback((newTitle: string) => {
        if (title === newTitle) return
        setTitle(newTitle)
        setHasUnsavedChanges(true)
        debouncedSave({ title: newTitle })
    }, [title, debouncedSave])

    const handleDescriptionChange = useCallback((newDescription: string) => {
        if (description === newDescription) return
        setDescription(newDescription)
        setHasUnsavedChanges(true)
        debouncedSave({ description: newDescription })
    }, [description, debouncedSave])

    // Chỉ cập nhật settings
    const handleSettingsChange = useCallback((newSettings: FormSettings) => {
        setSettings(newSettings)
        setHasUnsavedChanges(true)
        debouncedSave({ settings: newSettings })
    }, [debouncedSave])

    // Chỉ cập nhật danh sách câu hỏi
    const handleQuestionsChange = useCallback((updatedQuestions: Question[]) => {
        setQuestions(updatedQuestions)
        setHasUnsavedChanges(true)
        debouncedSave({ questions: updatedQuestions })
    }, [debouncedSave])

    const handleManualSave = useCallback(async () => {
        if (!hasUnsavedChanges) return
        debouncedSave.cancel()
        await saveForm({ title, settings, questions })
    }, [hasUnsavedChanges, title, settings, questions, debouncedSave])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <FormHeader
                formId={formId as string}
                title={title}
                settings={settings!}
                onTitleChange={handleTitleChange}
                onSave={handleManualSave}
                onUpdateSettings={handleSettingsChange}
                saving={saving}
                hasUnsavedChanges={hasUnsavedChanges}
            />

            <div className="flex">
                <main className="flex-1 px-4 py-8 mr-80 mt-[3.5rem]">
                    <FormEditor
                        description={description}
                        questions={questions}
                        onDescriptionChange={handleDescriptionChange}
                        onQuestionsChange={handleQuestionsChange}
                        saving={saving}
                    />
                </main>

                <FormSidebar
                    formId={formId as string}
                    settings={settings!}
                    onSettingsChange={handleSettingsChange}
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
