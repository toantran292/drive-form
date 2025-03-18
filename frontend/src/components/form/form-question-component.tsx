"use client";

import { memo, useCallback, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CopyIcon,
    GripVertical,
    TrashIcon,
    Circle,
    CheckSquare,
    Square,
    X
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "@/store/questions";

interface FormQuestionProps {
    question: Question;
    onUpdate: (question: Question) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const OptionItem = memo(({
    index,
    option,
    type,
    onUpdate,
    onDelete
}: {
    index: number;
    option: string;
    type: Question["type"];
    onUpdate: (value: string) => void;
    onDelete: () => void;
}) => {
    const icon = useMemo(() => {
        switch (type) {
            case "choice":
                return <Circle className="h-4 w-4 text-gray-400" />;
            case "checkbox":
                return <Square className="h-4 w-4 text-gray-400" />;
            case "dropdown":
                return <span className="text-sm text-gray-600">{index + 1}.</span>;
            default:
                return null;
        }
    }, [type, index]);

    return (
        <div className="group/option flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center">
                {icon}
            </div>
            <Input
                value={option}
                onChange={(e) => onUpdate(e.target.value)}
                className="flex-1"
                placeholder={`Tùy chọn ${index + 1}`}
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-9 w-9 opacity-0 group-hover/option:opacity-100"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
});

OptionItem.displayName = "OptionItem";

function FormQuestionComponent({ question, onUpdate, onDelete, onDuplicate }: FormQuestionProps) {
    const [isHovering, setIsHovering] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = useMemo(() => ({
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }), [transform, transition, isDragging]);

    const updateQuestion = useCallback((updates: Partial<Question>) => {
        onUpdate({ ...question, ...updates });
    }, [question, onUpdate]);

    const addOption = useCallback(() => {
        const options = question.options || [];
        updateQuestion({
            options: [...options, `Tùy chọn ${options.length + 1}`],
        });
    }, [question.options, updateQuestion]);

    const updateOption = useCallback((index: number, value: string) => {
        const options = [...(question.options || [])];
        options[index] = value;
        updateQuestion({ options });
    }, [question.options, updateQuestion]);

    const deleteOption = useCallback((index: number) => {
        const options = [...(question.options || [])];
        options.splice(index, 1);
        updateQuestion({ options });
    }, [question.options, updateQuestion]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateQuestion({ title: e.target.value });
    }, [updateQuestion]);

    const handleTypeChange = useCallback((value: Question["type"]) => {
        updateQuestion({ type: value });
    }, [updateQuestion]);

    const handleRequiredChange = useCallback((checked: boolean) => {
        updateQuestion({ required: checked });
    }, [updateQuestion]);

    const renderOptions = useMemo(() => {
        if (!["choice", "checkbox", "dropdown"].includes(question.type)) {
            return null;
        }

        return (
            <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                    <OptionItem
                        key={index}
                        index={index}
                        option={option}
                        type={question.type}
                        onUpdate={(value) => updateOption(index, value)}
                        onDelete={() => deleteOption(index)}
                    />
                ))}
                <div className="flex items-center gap-3">
                    <div className="w-9" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addOption}
                        className="h-9"
                    >
                        Thêm tùy chọn
                    </Button>
                </div>
            </div>
        );
    }, [question.type, question.options, updateOption, deleteOption, addOption]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative rounded-lg bg-white shadow-sm"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div
                {...attributes}
                {...listeners}
                className={`absolute -top-3 left-0 right-0 flex h-6 cursor-grab items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${isHovering ? "opacity-100" : ""
                    }`}
            >
                <div className="rounded-md bg-white p-1 shadow-sm">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Input
                            value={question.title}
                            onChange={handleTitleChange}
                            className="text-lg font-medium"
                            placeholder="Câu hỏi không có tiêu đề"
                        />
                        <Select
                            value={question.type}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Văn bản</SelectItem>
                                <SelectItem value="choice">Trắc nghiệm</SelectItem>
                                <SelectItem value="checkbox">Hộp kiểm</SelectItem>
                                <SelectItem value="dropdown">Danh sách thả xuống</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {renderOptions}
                </div>

                <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0"
                                onClick={onDuplicate}
                            >
                                <CopyIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="h-8 w-8 rounded-full p-0"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={question.required}
                                onCheckedChange={handleRequiredChange}
                            />
                            <span className="text-sm text-gray-600">Bắt buộc</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(FormQuestionComponent); 