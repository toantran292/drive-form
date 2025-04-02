'use client'

import { useEffect, useState } from 'react'
import {useParams, useRouter} from 'next/navigation'
import { Question, FormSettings } from '@/types/form'
import { QuestionView } from '@/components/forms/QuestionView'
import { toast } from 'sonner'
import axiosInstance from '@/lib/axios'
import {Button} from "@/components/ui/button";

export default function ResponseDetailPage() {
    const params = useParams()
    const responseId = params.responseId as string
    const formId = params.formId as string
    const router = useRouter()


    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [settings, setSettings] = useState<FormSettings | undefined>()
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchResponseDetails() {
            if (!responseId || !formId) return

            try {
                setLoading(true)
                const res = await axiosInstance.get(`/forms/${formId}/responses/${responseId}`)
                const data = res.data

                setTitle(data.form.title)
                setDescription(data.form.description)
                setSettings(data.form.settings)
                setQuestions(data.form.questions || [])

                const answerMap: Record<string, unknown> = {}
                for (const answer of data.answers) {
                    answerMap[answer.questionId] = answer.value
                }
                setAnswers(answerMap)
            } catch (err) {
                toast.error('Không thể tải dữ liệu phản hồi')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchResponseDetails()
    }, [formId, responseId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="h-2" style={{ backgroundColor: settings?.theme?.color || '#1a73e8' }} />
            <Button variant="outline" onClick={() => router.back()} className="mb-6">
                ← Quay lại
            </Button>

            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg border p-8 mb-6">
                    <h1 className="text-3xl font-medium mb-2">{title}</h1>
                    {description && <p className="text-gray-600">{description}</p>}
                </div>

                <div className="space-y-6">
                    {questions.map((question) => (
                        <QuestionView
                            key={question.id}
                            question={question}
                            value={answers[question.id]}
                            onChange={() => { }} // readonly
                            themeColor={settings?.theme?.color || '#1a73e8'}
                            readOnly // nếu hỗ trợ
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
