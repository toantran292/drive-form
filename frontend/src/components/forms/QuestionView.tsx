'use client'

import { Question, QuestionType } from '@/types/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'


interface QuestionOption {
    id: string
    value: string
}

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
                        defaultValue={value || ''}
                        onBlur={(e) => onChange(e.target.value)}
                        placeholder="Your answer"
                        className="max-w-md"
                    />
                )}

                {question.type === QuestionType.SINGLE_CHOICE && (
                    <RadioGroup
                        value={value}
                        onValueChange={onChange}
                        className="space-y-2"
                    >
                        <>
                        {question.options?.map((option) => {
                            const opt = option as unknown as QuestionOption
                            return (
                                <div key={opt.id} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value={opt.id}
                                        id={`${question.id}-${opt.id}`}
                                        style={{
                                            borderColor: themeColor,
                                            '--theme-color': themeColor
                                        } as unknown as React.CSSProperties}
                                    />
                                    <Label htmlFor={`${question.id}-${opt.id}`}>
                                        {opt.value}
                                    </Label>
                                </div>
                            )
                        })}
                        </>
                    </RadioGroup>
                )}

                {question.type === QuestionType.MULTIPLE_CHOICE && (
                    <div className="space-y-2">
                        {question.options?.map((option) => {
                            const opt = option as unknown as QuestionOption
                            return (
                                <div key={opt.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${question.id}-${opt.id}`}
                                        checked={(value || []).includes(opt.id)}
                                        onCheckedChange={(checked) => {
                                            const newValue = [...(value || [])]
                                            if (checked) {
                                                newValue.push(opt.id)
                                            } else {
                                                const index = newValue.indexOf(opt.id)
                                                if (index > -1) {
                                                    newValue.splice(index, 1)
                                                }
                                            }
                                            onChange(newValue)
                                        }}
                                        style={{
                                            borderColor: themeColor,
                                            '--theme-color': themeColor
                                        } as unknown as React.CSSProperties}
                                    />
                                    <Label htmlFor={`${question.id}-${opt.id}`}>
                                        {opt.value}
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Add other question types as needed */}
            </div>
        </div>
    )
} 