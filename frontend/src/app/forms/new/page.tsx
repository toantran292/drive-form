"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormQuestion } from "@/components/form/form-question";
import { useQuestionsStore } from "@/store/questions";
import {
    DndContext,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function NewFormPage() {
    const [title, setTitle] = useState("Mẫu không có tiêu đề");
    const [description, setDescription] = useState("");

    const { questions, questionIds, addQuestion, updateQuestion, deleteQuestion, duplicateQuestion, reorderQuestions } = useQuestionsStore();

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = questionIds.findIndex(id => id === active.id);
            const newIndex = questionIds.findIndex(id => id === over.id);
            reorderQuestions(oldIndex, newIndex);
        }
    };

    return (
        <div className="min-h-screen bg-purple-50 p-6">
            <div className="mx-auto max-w-3xl space-y-4">
                {/* Form Header */}
                <div className="rounded-lg border-t-8 border-purple-600 bg-white p-6 shadow-sm">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-none text-3xl font-bold focus-visible:ring-0"
                        placeholder="Mẫu không có tiêu đề"
                    />
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 border-none focus-visible:ring-0"
                        placeholder="Mô tả biểu mẫu"
                    />
                </div>

                {/* Questions */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={questionIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {questionIds.map((id) => (
                            <FormQuestion
                                key={id}
                                question={questions[id]}
                                onUpdate={updateQuestion}
                                onDelete={() => deleteQuestion(id)}
                                onDuplicate={() => duplicateQuestion(questions[id])}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {/* Add Question Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={addQuestion}
                        variant="outline"
                        className="rounded-full"
                    >
                        Thêm câu hỏi
                    </Button>
                </div>
            </div>
        </div>
    );
} 