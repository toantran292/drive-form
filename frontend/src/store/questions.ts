import { create } from 'zustand';
import { generateId } from '@/lib/utils';

export interface Question {
    id: string;
    type: "text" | "choice" | "checkbox" | "dropdown";
    title: string;
    required: boolean;
    options?: string[];
}

interface QuestionsState {
    questions: Record<string, Question>;
    questionIds: string[];
    addQuestion: () => void;
    updateQuestion: (question: Question) => void;
    deleteQuestion: (id: string) => void;
    duplicateQuestion: (question: Question) => void;
    reorderQuestions: (oldIndex: number, newIndex: number) => void;
}

const initialId = generateId();

export const useQuestionsStore = create<QuestionsState>((set) => ({
    questions: {
        [initialId]: {
            id: initialId,
            type: "text",
            title: "Câu hỏi không có tiêu đề",
            required: false,
        }
    },
    questionIds: [initialId],

    addQuestion: () => {
        const id = generateId();
        set((state) => ({
            questions: {
                ...state.questions,
                [id]: {
                    id,
                    type: "text",
                    title: "Câu hỏi không có tiêu đề",
                    required: false,
                }
            },
            questionIds: [...state.questionIds, id]
        }));
    },

    updateQuestion: (question) => {
        set((state) => ({
            questions: {
                ...state.questions,
                [question.id]: question
            }
        }));
    },

    deleteQuestion: (id) => {
        set((state) => {
            const { [id]: deleted, ...questions } = state.questions;
            return {
                questions,
                questionIds: state.questionIds.filter(qId => qId !== id)
            };
        });
    },

    duplicateQuestion: (question) => {
        const id = generateId();
        set((state) => {
            const index = state.questionIds.findIndex(qId => qId === question.id);
            const newQuestionIds = [...state.questionIds];
            newQuestionIds.splice(index + 1, 0, id);

            return {
                questions: {
                    ...state.questions,
                    [id]: {
                        ...question,
                        id
                    }
                },
                questionIds: newQuestionIds
            };
        });
    },

    reorderQuestions: (oldIndex: number, newIndex: number) => {
        set((state) => {
            const newQuestionIds = [...state.questionIds];
            const [removed] = newQuestionIds.splice(oldIndex, 1);
            newQuestionIds.splice(newIndex, 0, removed);
            return { questionIds: newQuestionIds };
        });
    }
})); 