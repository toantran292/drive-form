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
            return 'Short answer';
        // case QuestionType.PARAGRAPH:
        //     return 'Long answer';
        case QuestionType.MULTIPLE_CHOICE:
            return 'Multiple choice';
        case QuestionType.SINGLE_CHOICE:
            return 'Single choice';
        // case QuestionType.CHECKBOX:
        //     return 'Checkboxes';
        // case QuestionType.DROPDOWN:
        //     return 'Dropdown';
        // case QuestionType.FILE_UPLOAD:
        //     return 'File upload';
        // case QuestionType.DATE:
        //     return 'Date';
        // case QuestionType.TIME:
        //     return 'Time';
        // case QuestionType.LINEAR_SCALE:
        //     return 'Linear scale';
        // case QuestionType.MULTIPLE_CHOICE_GRID:
        //     return 'Multiple choice grid';
        // case QuestionType.CHECKBOX_GRID:
        //     return 'Checkbox grid';
        default:
            return type;
    }
};

const questionTypeIcons = {
    [QuestionType.TEXT]: '✏️',
    // [QuestionType.PARAGRAPH]: '📝',
    [QuestionType.MULTIPLE_CHOICE]: '⭕',
    [QuestionType.SINGLE_CHOICE]: '⭕',
    // [QuestionType.CHECKBOX]: '☑️',
    // [QuestionType.DROPDOWN]: '▼',
    // [QuestionType.FILE_UPLOAD]: '📎',
    // [QuestionType.DATE]: '📅',
    // [QuestionType.TIME]: '⏰',
    // [QuestionType.LINEAR_SCALE]: '📊',
    // [QuestionType.MULTIPLE_CHOICE_GRID]: '📑',
    // [QuestionType.CHECKBOX_GRID]: '🔲'
};

export function QuestionEditor({
    question,
    onChange,
    onDelete,
    onDuplicate,
    disabled = false
}: QuestionEditorProps) {
    return (
        <div className="rounded-lg border bg-white p-6 group">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                    <Input
                        value={question.title}
                        onChange={(e) =>
                            onChange({ ...question, title: e.target.value })
                        }
                        placeholder="Question"
                        className="text-lg"
                        disabled={disabled}
                    />

                    {question.description !== undefined && (
                        <Input
                            value={question.description}
                            onChange={(e) =>
                                onChange({ ...question, description: e.target.value })
                            }
                            placeholder="Description (optional)"
                            className="text-sm text-gray-600"
                            disabled={disabled}
                        />
                    )}

                    <Select
                        value={question.type}
                        onValueChange={(value) =>
                            onChange({ ...question, type: value as QuestionType })
                        }
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

                    {/* Question type specific options */}
                    {(question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.SINGLE_CHOICE) && (
                        <div className="space-y-2">
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-gray-400">
                                        {question.type === QuestionType.MULTIPLE_CHOICE && '○'}
                                        {question.type === QuestionType.SINGLE_CHOICE && '⭕'}
                                        {/* // {question.type === QuestionType.DROPDOWN && `${index + 1}.`} */}
                                    </span>
                                    <Input
                                        value={option}
                                        onChange={(e) => {
                                            const newOptions = [...(question.options || [])]
                                            newOptions[index] = e.target.value
                                            onChange({ ...question, options: newOptions })
                                        }}
                                        placeholder={`Option ${index + 1}`}
                                        disabled={disabled}
                                    />
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onChange({
                                        ...question,
                                        options: [...(question.options || []), '']
                                    })
                                }
                                disabled={disabled}
                                className="mt-2"
                            >
                                Add option
                            </Button>
                        </div>
                    )}

                    {/* Linear scale specific options */}
                    {/* {question.type === QuestionType.LINEAR_SCALE && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    type="number"
                                    value={question.scale?.start ?? 1}
                                    onChange={(e) =>
                                        onChange({
                                            ...question,
                                            scale: {
                                                ...question.scale,
                                                start: parseInt(e.target.value)
                                            }
                                        })
                                    }
                                    className="w-20"
                                    min={0}
                                    max={10}
                                    disabled={disabled}
                                />
                                <span>to</span>
                                <Input
                                    type="number"
                                    value={question.scale?.end ?? 5}
                                    onChange={(e) =>
                                        onChange({
                                            ...question,
                                            scale: {
                                                ...question.scale,
                                                end: parseInt(e.target.value)
                                            }
                                        })
                                    }
                                    className="w-20"
                                    min={1}
                                    max={10}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    value={question.scale?.startLabel ?? ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...question,
                                            scale: {
                                                ...question.scale,
                                                startLabel: e.target.value
                                            }
                                        })
                                    }
                                    placeholder="Start label (optional)"
                                    disabled={disabled}
                                />
                                <Input
                                    value={question.scale?.endLabel ?? ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...question,
                                            scale: {
                                                ...question.scale,
                                                endLabel: e.target.value
                                            }
                                        })
                                    }
                                    placeholder="End label (optional)"
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    )} */}
                </div>

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