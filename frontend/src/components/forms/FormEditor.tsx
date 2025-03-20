'use client'

import { Form, Question, QuestionType } from '@/types/form'
import { QuestionEditor } from './QuestionEditor'
import { Button } from '@/components/ui/button'
import { FiPlus } from 'react-icons/fi'
import { Input } from '@/components/ui/input'

interface FormEditorProps {
    formId: string
    form: Form
    onChange: (form: Form) => Promise<void>
    saving?: boolean
}

export function FormEditor({ formId, form, onChange, saving = false }: FormEditorProps) {
    const addQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            type: QuestionType.TEXT,
            title: '',
            required: false,
        }
        onChange({
            ...form,
            questions: [...form.questions, newQuestion]
        })
    }

    const duplicateQuestion = (questionToDuplicate: Question) => {
        const newQuestion: Question = {
            ...questionToDuplicate,
            id: crypto.randomUUID(),
            title: `${questionToDuplicate.title}`,
        }

        const index = form.questions.findIndex(q => q.id === questionToDuplicate.id)

        const updatedQuestions = [...form.questions]
        updatedQuestions.splice(index + 1, 0, newQuestion)

        onChange({
            ...form,
            questions: updatedQuestions
        })
    }

    return (
        <div className="mx-auto max-w-3xl space-y-4">
            {/* Form description */}
            <div className="rounded-lg border bg-white p-6">
                <Input
                    value={form.description || ''}
                    onChange={(e) => onChange({
                        ...form,
                        description: e.target.value
                    })}
                    className="text-sm text-gray-600"
                    placeholder="Form description"
                    disabled={saving}
                />
            </div>

            {/* Questions */}
            {form.questions.map((question) => (
                <QuestionEditor
                    key={question.id}
                    question={question}
                    onChange={(updatedQuestion) => {
                        onChange({
                            ...form,
                            questions: form.questions.map((q) =>
                                q.id === question.id ? updatedQuestion : q
                            )
                        })
                    }}
                    onDelete={() => {
                        onChange({
                            ...form,
                            questions: form.questions.filter((q) => q.id !== question.id)
                        })
                    }}
                    onDuplicate={() => duplicateQuestion(question)}
                    disabled={saving}
                />
            ))}

            {/* Add question button */}
            <Button
                variant="outline"
                className="w-full"
                onClick={addQuestion}
                disabled={saving}
            >
                <FiPlus className="mr-2 h-4 w-4" />
                Add question
            </Button>
        </div>
    )
} 