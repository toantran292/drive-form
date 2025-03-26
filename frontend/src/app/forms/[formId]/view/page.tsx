'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { Question, FormSettings } from '@/types/form'
import { getForm, submitFormResponse } from '@/app/api/drive'
import { QuestionView } from '@/components/forms/QuestionView'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function FormViewPage() {
    const router = useRouter()
    const pathname = usePathname()
    const { formId } = useParams()


    const [title, setTitle] = useState<string | undefined>()
    const [description, setDescription] = useState<string | undefined>()
    const [questions, setQuestions] = useState<Question[]>([])
    const [settings, setSettings] = useState<FormSettings | object>({
        theme: {
            color: '#1a73e8'
        }
    })

    const [message, setMessage] = useState('')

    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [submitting, setSubmitting] = useState(false)


    useEffect(() => {
        async function loadForm() {
            try {
                setLoading(true)
                const formData = await getForm(formId as string, true)

                setTitle(formData.title)
                setDescription(formData.description)
                setQuestions(formData.questions as Question[] || [])
                if (formData.settings) {
                    setSettings(formData.settings)
                }
                setMessage((formData as unknown as { message: string }).message || '')
            } catch (error: unknown) {
                console.error('Failed to load form:', error)
                toast.error('Failed to load form')
            } finally {
                setLoading(false)
            }
        }

        if (formId) {
            loadForm()
        }
    }, [formId])

    const handleAnswerChange = (questionId: string, value: unknown) => {
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
        // Validate required questions
        if (!validateAnswers(questions)) {
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
            toast.success((settings as unknown as { confirmationMessage: string }).confirmationMessage || 'Response submitted successfully')
            // Redirect to confirmation page or clear form
        } catch (err: unknown) {
            console.error('Failed to submit response:', err)
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

    // const questions = form.settings.shuffleQuestions
    //     ? [...form.questions].sort(() => Math.random() - 0.5)
    //     : form.questions

    // const questionsPerPage = 5
    // const totalPages = Math.ceil(questions.length / questionsPerPage)
    // const currentQuestions = questions.slice(
    //     currentPage * questionsPerPage,
    //     (currentPage + 1) * questionsPerPage
    // )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Form Header */}
            <div
                className="h-2"
                style={{ backgroundColor: (settings as unknown as { theme: { color: string } }).theme.color }}
            />

            <div className="max-w-3xl mx-auto py-8 px-4">
                {/* Form Title */}
                <div className="bg-white rounded-lg border p-8 mb-6">
                    <h1 className="text-3xl font-medium mb-2">{title}</h1>
                    {description && (
                        <p className="text-gray-600">{description}</p>
                    )}
                    {(settings as unknown as { collectEmail: boolean }).collectEmail && (
                        <p className="text-sm text-red-500 mt-4">
                            * This form requires email verification
                        </p>
                    )}

                    {message && (
                        <p className="text-sm text-red-500 mt-4">
                            {message}
                        </p>
                    )}
                </div>

                {/* Progress Bar */}
                {/* {(settings as any).showProgressBar && (
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
                )} */}

                {/* Questions */}
                <div className="space-y-6">
                    {questions.map((question) => (
                        <QuestionView
                            key={question.id}
                            question={question}
                            value={answers[question.id]}
                            onChange={(value) => handleAnswerChange(question.id, value)}
                            themeColor={(settings as unknown as { theme: { color: string } }).theme.color}
                        />
                    ))}
                </div>

                {message === 'Please sign in to submit this form' ? (<Button
                    onClick={() => {
                        const searchParams = new URLSearchParams({
                            callbackUrl: pathname,
                        });
                        router.replace(`/login?${searchParams.toString()}`);
                    }}
                    className="ml-auto cursor-pointer mt-4"
                >
                    Login to submit
                </Button>) : null
                }

                {!message ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="ml-auto cursor-pointer mt-4"
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                ) : null}
            </div>
        </div>
    )
} 