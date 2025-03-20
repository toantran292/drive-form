'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Question, Form } from '@/types/form'
import { getForm, submitFormResponse } from '@/app/api/drive'
import { QuestionView } from '@/components/forms/QuestionView'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function FormViewPage() {
    const { formId } = useParams()
    const [form, setForm] = useState<Form | null>(null)
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [currentPage, setCurrentPage] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function loadForm() {
            try {
                setLoading(true)
                const formData = await getForm(formId as string, true)

                // Kiểm tra form có được publish không
                if (!formData.settings.isPublished) {
                    toast.error('This form is not available')
                    return
                }

                // Kiểm tra form có đang nhận responses không
                if (!formData.settings.acceptingResponses) {
                    toast.error('This form is no longer accepting responses')
                    return
                }

                setForm(formData)
            } catch (err) {
                toast.error('Failed to load form')
            } finally {
                setLoading(false)
            }
        }

        if (formId) {
            loadForm()
        }
    }, [formId])

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const validateAnswers = (questions: Question[]) => {
        for (const question of questions) {
            if (question.required && !answers[question.id]) {
                return false
            }
        }
        return true
    }

    const handleSubmit = async () => {
        if (!form) return

        // Validate required questions
        if (!validateAnswers(form.questions)) {
            toast.error('Please answer all required questions')
            return
        }

        try {
            setSubmitting(true)
            await submitFormResponse(formId as string, {
                answers: Object.entries(answers).map(([questionId, value]) => ({
                    questionId,
                    value
                }))
            })
            toast.success(form.settings.confirmationMessage || 'Response submitted successfully')
            // Redirect to confirmation page or clear form
        } catch (err) {
            toast.error('Failed to submit response')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        )
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">Form not found</div>
            </div>
        )
    }

    const questions = form.settings.shuffleQuestions
        ? [...form.questions].sort(() => Math.random() - 0.5)
        : form.questions

    const questionsPerPage = 5
    const totalPages = Math.ceil(questions.length / questionsPerPage)
    const currentQuestions = questions.slice(
        currentPage * questionsPerPage,
        (currentPage + 1) * questionsPerPage
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Form Header */}
            <div
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ backgroundColor: form.settings.theme.color }}
            />

            <div className="max-w-3xl mx-auto py-8 px-4">
                {/* Form Title */}
                <div className="bg-white rounded-lg border p-8 mb-6">
                    <h1 className="text-3xl font-medium mb-2">{form.title}</h1>
                    {form.description && (
                        <p className="text-gray-600">{form.description}</p>
                    )}
                    {form.settings.collectEmail && (
                        <p className="text-sm text-red-500 mt-4">
                            * This form requires email verification
                        </p>
                    )}
                </div>

                {/* Progress Bar */}
                {form.settings.showProgressBar && (
                    <div className="mb-6">
                        <div className="h-1 bg-gray-200 rounded-full">
                            <div
                                className="h-1 bg-blue-500 rounded-full transition-all"
                                style={{
                                    width: `${(currentPage + 1) / totalPages * 100}%`,
                                    backgroundColor: form.settings.theme.color
                                }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Page {currentPage + 1} of {totalPages}
                        </p>
                    </div>
                )}

                {/* Questions */}
                <div className="space-y-6">
                    {currentQuestions.map((question) => (
                        <QuestionView
                            key={question.id}
                            question={question}
                            value={answers[question.id]}
                            onChange={(value) => handleAnswerChange(question.id, value)}
                            themeColor={form.settings.theme.color}
                        />
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    {currentPage > 0 && (
                        <Button
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            variant="outline"
                        >
                            <FiChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                    )}

                    {currentPage < totalPages - 1 ? (
                        <Button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="ml-auto"
                        >
                            Next
                            <FiChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="ml-auto"
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
} 