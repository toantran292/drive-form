'use client'

import { Question, QuestionType } from '@/types/form'
import { QuestionEditor } from './QuestionEditor'
import { Button } from '@/components/ui/button'
import { FiPlus } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { useMemo, useCallback, memo, useRef } from 'react'

interface FormEditorProps {
    description: string
    questions: Question[]
    saving?: boolean
    onDescriptionChange: (newDescription: string) => void
    onQuestionsChange: (updatedQuestions: Question[]) => void
}

function FormEditorComponent({
    description,
    questions,
    saving = false,
    onDescriptionChange,
    onQuestionsChange
}: FormEditorProps) {
    // Dùng useRef để giữ danh sách câu hỏi, tránh tạo lại mảng mới khi không cần thiết
    const questionsRef = useRef(questions)
    useMemo(() => {
        questionsRef.current = questions
    }, [questions])

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (description === e.target.value) return
            onDescriptionChange(e.target.value)
        },
        [description, onDescriptionChange]
    )

    const addQuestion = useCallback(() => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            type: QuestionType.TEXT,
            title: '',
            required: false,
        }

        const updatedQuestions = [...questionsRef.current, newQuestion]
        questionsRef.current = updatedQuestions
        onQuestionsChange(updatedQuestions)
    }, [onQuestionsChange])

    const handleQuestionChange = useCallback(
        (updatedQuestion: Question) => {
            const updatedQuestions = questionsRef.current.map((q) =>
                q.id === updatedQuestion.id ? updatedQuestion : q
            )
            questionsRef.current = updatedQuestions
            onQuestionsChange(updatedQuestions)
        },
        [onQuestionsChange]
    )

    const handleDeleteQuestion = useCallback(
        (questionId: string) => {
            const updatedQuestions = questionsRef.current.filter((q) => q.id !== questionId)
            questionsRef.current = updatedQuestions
            onQuestionsChange(updatedQuestions)
        },
        [onQuestionsChange]
    )

    const duplicateQuestion = useCallback(
        (questionToDuplicate: Question) => {
            const newQuestion: Question = {
                ...questionToDuplicate,
                id: crypto.randomUUID(),
                title: `${questionToDuplicate.title} (Copy)`,
            }

            const index = questionsRef.current.findIndex(q => q.id === questionToDuplicate.id)

            const updatedQuestions = [...questionsRef.current]
            updatedQuestions.splice(index + 1, 0, newQuestion)

            questionsRef.current = updatedQuestions
            onQuestionsChange(updatedQuestions)
        },
        [onQuestionsChange]
    )

    return (
        <div className="mx-auto max-w-3xl space-y-4">
            {/* Form description */}
            <div className="rounded-lg border bg-white p-6">
                <Input
                    defaultValue={description}
                    onBlur={handleDescriptionChange}
                    className="text-sm text-gray-600"
                    placeholder="Form description"
                    disabled={saving}
                />
            </div>

            {/* Questions */}
            {questionsRef.current.map((question) => (
                <QuestionEditor
                    key={question.id}
                    question={question}
                    onChange={handleQuestionChange}
                    onDelete={() => handleDeleteQuestion(question.id)}
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
                Thêm câu hỏi
            </Button>
        </div>
    )
}

const FormEditor = memo(FormEditorComponent)

export { FormEditor }
