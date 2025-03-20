'use client'

import { Question, QuestionType } from '@/types/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FiTrash2, FiCopy } from 'react-icons/fi'
import { memo, useCallback } from 'react'

interface QuestionEditorProps {
    question: Question
    onChange: (question: Question) => void
    onDelete: () => void
    onDuplicate: () => void
    disabled?: boolean
}

const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
        case QuestionType.TEXT:
            return 'Short answer'
        case QuestionType.MULTIPLE_CHOICE:
            return 'Multiple choice'
        case QuestionType.SINGLE_CHOICE:
            return 'Single choice'
        default:
            return type
    }
}

const questionTypeIcons = {
    [QuestionType.TEXT]: '✏️',
    [QuestionType.MULTIPLE_CHOICE]: '⭕',
    [QuestionType.SINGLE_CHOICE]: '⭕',
}

function QuestionEditorComponent({
    question,
    onChange,
    onDelete,
    onDuplicate,
    disabled = false
}: QuestionEditorProps) {
    // Dùng useCallback để tránh tạo lại function mỗi lần render
    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (question.title === e.target.value) return
            onChange({ ...question, title: e.target.value })
        },
        [question, onChange]
    )

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (question.description === e.target.value) return
            onChange({ ...question, description: e.target.value })
        },
        [question, onChange]
    )

    const handleTypeChange = useCallback(
        (value: string) => {
            if (question.type === value) return
            onChange({ ...question, type: value as QuestionType })
        },
        [question, onChange]
    )

    const handleOptionChange = useCallback(
        (index: number, value: string) => {
            const newOptions = [...(question.options || [])]
            if (newOptions[index] === value) return
            newOptions[index] = value
            onChange({ ...question, options: newOptions })
        },
        [question, onChange]
    )

    const addOption = useCallback(() => {
        onChange({
            ...question,
            options: [...(question.options || []), '']
        })
    }, [question, onChange])

    return (
        <div className="rounded-lg border bg-white p-6 group">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                    {/* Question Title */}
                    <Input
                        defaultValue={question.title}
                        onBlur={handleTitleChange}
                        placeholder="Question"
                        className="text-lg"
                        disabled={disabled}
                    />

                    {/* Question Description (if exists) */}
                    {question.description !== undefined && (
                        <Input
                            defaultValue={question.description}
                            onBlur={handleDescriptionChange}
                            placeholder="Description (optional)"
                            className="text-sm text-gray-600"
                            disabled={disabled}
                        />
                    )}

                    {/* Select Question Type */}
                    <Select
                        value={question.type}
                        onValueChange={handleTypeChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(QuestionType).map((type) => (
                                <SelectItem
                                    key={type}
                                    value={type}
                                    className="flex items-center gap-2"
                                >
                                    <span className="mr-2">{questionTypeIcons[type]}</span>
                                    {getQuestionTypeLabel(type)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Question Type Specific Fields */}
                    {(question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.SINGLE_CHOICE) && (
                        <div className="space-y-2">
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-gray-400">
                                        {question.type === QuestionType.MULTIPLE_CHOICE ? '○' : '⭕'}
                                    </span>
                                    <Input
                                        defaultValue={option}
                                        onBlur={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        disabled={disabled}
                                    />
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                                disabled={disabled}
                                className="mt-2"
                            >
                                Add option
                            </Button>
                        </div>
                    )}
                </div>

                {/* Question Controls */}
                <div className="flex flex-col items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        disabled={disabled}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete question"
                    >
                        <FiTrash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDuplicate}
                        disabled={disabled}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Duplicate question"
                    >
                        <FiCopy className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={question.required}
                            onCheckedChange={(checked) =>
                                onChange({ ...question, required: checked })
                            }
                            disabled={disabled}
                        />
                        <span className="text-sm">Required</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Bọc component với React.memo để chặn re-render không cần thiết
const QuestionEditor = memo(QuestionEditorComponent, (prevProps, nextProps) => {
    return (
        prevProps.question === nextProps.question &&
        prevProps.disabled === nextProps.disabled
    )
})

export { QuestionEditor }
