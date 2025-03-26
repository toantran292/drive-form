import axios from '@/lib/axios';
import { FormSettings } from '@/types/form';
import { AxiosError } from 'axios';

export interface DriveItem {
    id: string;
    name: string;
    type: 'file' | 'folder' | 'form';
    mimeType?: string;
    size?: number;
    downloadUrl?: string;
    createdAt: string;
    modifiedAt: string;
    ownerId: string;
    parentId?: string;
    formId?: string;
    owner?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreateFormDto {
    title: string;
    parentId?: string;
}

export interface CreateFormResponse {
    success: boolean;
    item: DriveItem;
}

export async function createForm(data: CreateFormDto): Promise<CreateFormResponse> {
    const response = await axios.post('/drive/forms', data, {
        params: data.parentId ? { parentId: data.parentId } : undefined
    });
    return response.data;
}

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/drive/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function listFiles(parentId?: string) {
    const response = await axios.get('/drive/files', {
        params: { parentId }
    });
    return response.data;
}

export async function deleteFile(fileId: string) {
    const response = await axios.delete(`/drive/files/${fileId}`);
    return response.data;
}

export async function getPreviewUrl(fileId: string) {
    const response = await axios.get(`/drive/files/${fileId}/preview`);
    return response.data;
}

export async function getDownloadUrl(fileId: string) {
    const response = await axios.get(`/drive/files/${fileId}/download`);
    return response.data;
}

export async function getSharedFiles(): Promise<DriveItem[]> {
    const response = await axios.get('/drive/shared');
    return response.data;
}

export interface ShareResponse {
    success: boolean;
    message: string;
    shareLink: string;
}

export async function shareFile(fileId: string, data: { emails?: string[], isPublic: boolean }): Promise<ShareResponse> {
    const response = await axios.post(`/drive/${fileId}/share`, data);
    return response.data;
}

export async function getShareLink(fileId: string): Promise<string> {
    const response = await axios.get(`/drive/${fileId}/share-link`);
    return response.data.shareLink;
}

export interface ShareInfo {
    isPublic: boolean;
    shareLink?: string;
    sharedWith: string[];
}

export async function getShareInfo(fileId: string): Promise<ShareInfo> {
    const response = await axios.get(`/drive/${fileId}/share`);
    return response.data;
}

export async function getSharedFileByShareId(shareId: string): Promise<DriveItem> {
    const response = await axios.get(`/drive/share/${shareId}`);
    return response.data;
}

export interface Question {
    id: string;
    type: 'text' | 'paragraph' | 'multipleChoice' | 'checkbox' | 'dropdown' | 'fileUpload' | 'date' | 'time' | 'linearScale' | 'multipleChoiceGrid' | 'checkboxGrid';
    title: string;
    description?: string;
    required: boolean;
    options?: string[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        allowedFileTypes?: string[];
    };
    layout?: {
        columns?: number;
        rows?: string[];
    };
    scale?: {
        start: number;
        end: number;
        startLabel?: string;
        endLabel?: string;
    };
}

export interface FormResponse {
    id: string;
    respondentId?: string;
    respondentEmail?: string;
    submittedAt: Date;
    answers: {
        questionId: string;
        value: unknown;
    }[];
}

export interface Form {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
    settings: FormSettings;
    ownerId: string;
    owner: {
        id: string;
        email: string;
        displayName?: string;
    };
    createdAt: Date;
    modifiedAt: Date;
    isPublic: boolean;
    shareId?: string;
    sharedWith: { userId: string; permission: 'view' | 'edit' }[];
    isActive: boolean;
    responses: FormResponse[];
}

export async function getForm(formId: string, isView?: boolean): Promise<Form> {
    const url = isView ? `/drive/forms/${formId}/view` : `/drive/forms/${formId}`;
    const response = await axios.get(url);
    return response.data;
}

export async function updateForm(formId: string, data: Partial<Form>): Promise<{
    form: Form;
    driveItem?: DriveItem;
}> {
    delete data.responses;
    const response = await axios.patch(`/drive/forms/${formId}`, data);
    return response.data;
}

export async function submitFormResponse(
    formId: string,
    data: Partial<Pick<FormResponse, 'answers' | 'respondentEmail'>>
): Promise<void> {
    await axios.post(`/drive/forms/${formId}/responses`, data);
}

interface UploadUrlResponse {
    success: boolean;
    url: string;
    path: string;
}

interface SaveFileResponse {
    success: boolean;
    file: DriveItem;
}

export async function getUploadUrl(fileInfo: {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    encoding: string;
    buffer: Buffer | null;
}, parentId?: string): Promise<UploadUrlResponse> {
    const { data } = await axios.post<UploadUrlResponse>(
        `/drive/get-upload-url${parentId ? `?parentId=${parentId}` : ''}`,
        fileInfo
    );
    return data;
}

export async function saveFile(fileInfo: {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    encoding: string;
    storagePath: string;
}, parentId?: string): Promise<SaveFileResponse> {
    const { data } = await axios.post<SaveFileResponse>(
        `/drive/save-file${parentId ? `?parentId=${parentId}` : ''}`,
        fileInfo
    );
    return data;
}

export async function uploadFileToStorage(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
) {
    return axios.put(url, file, {
        headers: {
            'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress?.(percentCompleted);
            }
        }
    });
}

export interface CreateFolderRequest {
    name: string;
    parentId?: string | null;
}

export interface CreateFolderResponse {
    success: boolean;
    folder?: DriveItem;
    message?: string;
}

export async function createFolder(data: CreateFolderRequest): Promise<CreateFolderResponse> {
    try {
        const response = await axios.post<CreateFolderResponse>('/drive/folders', data);
        return response.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to create folder');
    }
}

export async function moveItem(itemId: string, targetFolderId: string) {
    try {
        const response = await axios.post(`/drive/items/${itemId}/move`, {
            targetFolderId
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export interface PathItem {
    id: string;
    name: string;
}

export interface GetFolderPathResponse {
    success: boolean;
    path: PathItem[];
    message?: string;
}

export async function getFolderPath(folderId: string): Promise<GetFolderPathResponse> {
    try {
        const response = await axios.get<GetFolderPathResponse>(`/drive/folders/${folderId}/path`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to get folder path');
        }
        throw error;
    }
} 