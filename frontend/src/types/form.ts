export enum QuestionType {
    TEXT = 'text',
    SINGLE_CHOICE = 'single_choice',
    MULTIPLE_CHOICE = 'multiple_choice',
    // CHECKBOX = 'checkbox',
}

export interface Question {
    id: string
    type: QuestionType
    title: string
    required: boolean
    options?: string[]
    description?: string
    order?: number
}

export interface Form {
    id: string
    title: string
    description?: string
    questions: Question[]
    isActive: boolean
    ownerId: string
    createdAt: string
    modifiedAt: string
    isPublic: boolean
    settings: FormSettings
}

export interface FormSettings {
    collectEmail: boolean;
    limitOneResponsePerUser: boolean;
    showProgressBar: boolean;
    shuffleQuestions: boolean;
    confirmationMessage: string;
    theme: {
        color: string;
        font: string;
        headerImage?: string;
    };
    isPublished: boolean;
    publishedAt?: Date;
    allowAnonymous: boolean;
    acceptingResponses: boolean;
}