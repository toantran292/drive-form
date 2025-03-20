'use client'

import { Question, QuestionType } from '@/types/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface QuestionViewProps {
    question: Question
    value: any
    onChange: (value: any) => void
    themeColor?: string
}

export function QuestionView({
    question,
    value,
    onChange,
    themeColor = '#1a73e8'
}: QuestionViewProps) {
    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-start gap-2 mb-4">
                <h3 className="text-lg font-medium flex-1">
                    {question.title}
                    {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                    )}
                </h3>
            </div>

            {question.description && (
                <p className="text-sm text-gray-600 mb-4">
                    {question.description}
                </p>
            )}

            <div className="mt-4">
                {question.type === QuestionType.TEXT && (
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Your answer"
                        className="max-w-md"
                    />
                )}

                {/* {question.type === QuestionType.PARAGRAPH && (
                    <Textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Your answer"
                        className="max-w-md"
                    />
                )} */}

                {question.type === QuestionType.MULTIPLE_CHOICE && (
                    <RadioGroup
                        value={value}
                        onValueChange={onChange}
                        className="space-y-2"
                    >
                        {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value={option}
                                    id={`${question.id}-${index}`}
                                    style={{
                                        borderColor: themeColor,
                                        '--theme-color': themeColor
                                    } as any}
                                />
                                <Label htmlFor={`${question.id}-${index}`}>
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}

                {question.type === QuestionType.SINGLE_CHOICE && (
                    <div className="space-y-2">
                        {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${question.id}-${index}`}
                                    checked={(value || []).includes(option)}
                                    onCheckedChange={(checked) => {
                                        const newValue = [...(value || [])]
                                        if (checked) {
                                            newValue.push(option)
                                        } else {
                                            const index = newValue.indexOf(option)
                                            if (index > -1) {
                                                newValue.splice(index, 1)
                                            }
                                        }
                                        onChange(newValue)
                                    }}
                                    style={{
                                        borderColor: themeColor,
                                        '--theme-color': themeColor
                                    } as any}
                                />
                                <Label htmlFor={`${question.id}-${index}`}>
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add other question types as needed */}
            </div>
        </div>
    )
} 