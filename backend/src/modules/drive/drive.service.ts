import { Injectable, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriveItem, DriveItemType } from '../../entities/drive-item.entity';
import { FirebaseStorageService } from '../../shared/services/firebase-storage.service';
import { User } from '../../entities/user.entity';
import * as crypto from 'crypto';
import { Brackets } from 'typeorm';
import { Form, QuestionType } from '../../entities/form.entity';
import { CreateFormDto } from '../form/form.dto';
import { FormResponse } from '../../entities/form.entity';
import { from } from 'rxjs';
import { In } from 'typeorm';
import { Readable } from 'stream';
import axios from 'axios';
import { CreateFolderDto } from './drive.dto';

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
];

export interface ShareFileDto {
    emails?: string[];
    isPublic?: boolean;
}

export interface ShareResponse {
    success: boolean;
    message: string;
    shareLink: string;
}

interface FormAnalytics {
    totalResponses: number;
    responsesByDate: { [date: string]: number };
    questions: {
        [questionId: string]: QuestionAnalytics;
    };
}

interface QuestionAnalytics {
    totalResponses: number;
    options: { [value: string]: number };
    skipped: number;
}

interface FormAnswer {
    questionId: string;
    value: string | string[];
}

interface FormResponseData {
    answers: FormAnswer[];
    email?: string;
    userId?: string;
    submittedAt: Date;
}

interface Question {
    id: string;
    type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TEXT' | 'PARAGRAPH';
    title: string;
    options?: Array<{ value: string; label: string }>;
}

interface StreamResponse {
    stream: Readable;
    headers: {
        'Content-Type': string;
        'Content-Length'?: string;
        [key: string]: string | undefined;
    };
    fileName: string;
    mimeType: string;
}

@Injectable()
export class DriveService {
    constructor(
        @InjectRepository(DriveItem)
        private driveItemRepository: Repository<DriveItem>,
        @InjectRepository(Form)
        private formRepository: Repository<Form>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(FormResponse)
        private formResponseRepository: Repository<FormResponse>,

        private storageService: FirebaseStorageService,
    ) { }

    private generatePath(userId: string, name: string) {
        const datePath = `${new Date().getFullYear()}/${new Date().getMonth() + 1}`;

        return `users/${userId}/${datePath}/${Date.now()}-${name}`;
    }

    async getUploadUrl(userId: string, body: MulterFile) {
        if (!ALLOWED_MIME_TYPES.includes(body.mimetype)) {
            throw new BadRequestException('File type not allowed. Only images and PDF files are supported.');
        }

        const storagePath = this.generatePath(userId, body.originalname);
        const url = await this.storageService.writeSignedUrl(storagePath);

        return {
            url,
            path: storagePath
        };
    }

    async getRetriveUrl(fileId: string) {
        const driveItem = await this.driveItemRepository.findOne({
            where: { id: fileId }
        });

        if (!driveItem) {
            throw new NotFoundException('File not found');
        }

        return this.storageService.readSignedUrl(driveItem.storagePath);
    }

    async saveFile(
        file: {
            fieldname: string;
            originalname: string;
            mimetype: string;
            size: number;
            encoding: string;
            storagePath: string;
        },
        storagePath: string,
        userId: string,
        parentId?: string
    ) {
        if (parentId) {
            const parent = await this.driveItemRepository.findOne({
                where: { id: parentId, type: DriveItemType.FOLDER }
            });

            if (!parent) {
                throw new NotFoundException('Parent folder not found');
            }
        }

        const driveItem = this.driveItemRepository.create({
            name: file.originalname,
            type: DriveItemType.FILE,
            mimeType: file.mimetype,
            size: file.size,
            storagePath: storagePath,
            ownerId: userId,
            parentId: parentId,
            downloadUrl: await this.storageService.readSignedUrl(storagePath)
        });

        const savedItem = await this.driveItemRepository.save(driveItem);

        // Cập nhật descendants info của parent folder nếu có

        console.log("savedItem", savedItem)

        if (parentId) {
            const parentFolder = await this.driveItemRepository.findOne({
                where: { id: parentId }
            });
            if (parentFolder) {
                await parentFolder.updateDescendantsInfo(this.driveItemRepository.manager.connection.createQueryRunner());
                await this.driveItemRepository.save(parentFolder);
            }
        }

        return {
            success: true,
            file: savedItem
        };
    }

    async deleteFile(fileId: string, userId: string) {
        const queryRunner = this.driveItemRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const driveItem = await queryRunner.manager.findOne(DriveItem, {
                where: { id: fileId },
                relations: ['children']
            });

            if (!driveItem) {
                throw new NotFoundException('File not found');
            }

            if (driveItem.ownerId !== userId) {
                throw new ForbiddenException('You do not have permission to delete this item');
            }

            // Nếu là folder, cập nhật descendantIds trước
            if (driveItem.type === DriveItemType.FOLDER) {
                await driveItem.updateDescendantsInfo(queryRunner);

                // Xóa tất cả các items con (bao gồm files trong storage)
                for (const descendantId of driveItem.descendantIds) {
                    const descendant = await queryRunner.manager.findOne(DriveItem, {
                        where: { id: descendantId }
                    });

                    if (descendant?.type === DriveItemType.FILE) {
                        await this.storageService.deleteFile(descendant.storagePath);
                    } else if (descendant?.type === DriveItemType.FORM) {
                        // Xóa form và các responses liên quan
                        await queryRunner.manager.delete(Form, { id: descendant.formId });
                    }
                }

                // Xóa tất cả descendants trong database
                await queryRunner.manager.delete(DriveItem, {
                    id: In(driveItem.descendantIds)
                });
            } else if (driveItem.type === DriveItemType.FILE) {
                // Xóa file từ storage
                await this.storageService.deleteFile(driveItem.storagePath);
            } else if (driveItem.type === DriveItemType.FORM) {
                // Xóa form và các responses liên quan
                await queryRunner.manager.delete(Form, { id: driveItem.formId });
            }

            // Xóa drive item chính
            await queryRunner.manager.remove(driveItem);

            // Cập nhật descendants info của parent folder nếu có
            if (driveItem.parentId) {
                const parentFolder = await queryRunner.manager.findOne(DriveItem, {
                    where: { id: driveItem.parentId }
                });
                if (parentFolder) {
                    await parentFolder.updateDescendantsInfo(queryRunner);
                    await queryRunner.manager.save(parentFolder);
                }
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(`Failed to delete item: ${error.message}`);
        } finally {
            await queryRunner.release();
        }
    }

    async shareFile(fileId: string, userId: string, shareData: ShareFileDto): Promise<ShareResponse> {
        const queryRunner = this.driveItemRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const driveItem = await queryRunner.manager.findOne(DriveItem, {
                where: { id: fileId, ownerId: userId },
                relations: ['parent']
            });

            if (!driveItem) {
                throw new NotFoundException('Item not found');
            }

            // Tạo shareId nếu chưa có
            if (!driveItem.shareId) {
                driveItem.shareId = crypto.randomUUID();
            }

            // Cập nhật trạng thái public
            if (typeof shareData.isPublic === 'boolean') {
                driveItem.isPublic = shareData.isPublic;
            }

            // Xử lý danh sách người dùng được chia sẻ
            if (shareData.emails?.length) {
                const sharedUsers = await queryRunner.manager.find(User, {
                    where: { email: In(shareData.emails) }
                });

                if (sharedUsers.length === 0) {
                    throw new BadRequestException('No valid users found for the provided emails');
                }

                // Khởi tạo mảng sharedWith nếu chưa có
                if (!Array.isArray(driveItem.sharedWith)) {
                    driveItem.sharedWith = [];
                }

                // Thêm người dùng mới vào danh sách share
                for (const user of sharedUsers) {
                    const existingShare = driveItem.sharedWith.find(share => share.userId === user.uid);
                    if (!existingShare) {
                        driveItem.sharedWith.push({
                            userId: user.uid,
                            permission: 'read'
                        });
                    }
                }
            } else if (shareData.emails?.length === 0) {
                driveItem.sharedWith = [];
            }

            // Nếu là folder, lan truyền quyền xuống các items con
            if (driveItem.type === DriveItemType.FOLDER) {
                await driveItem.updateDescendantsInfo(queryRunner);

                // Cập nhật isPublic cho tất cả descendants
                if (typeof shareData.isPublic === 'boolean') {
                    await queryRunner.manager.update(DriveItem, {
                        id: In(driveItem.descendantIds)
                    }, {
                        isPublic: shareData.isPublic
                    });
                }

                // Lan truyền quyền share cho tất cả descendants
                for (const userId of driveItem.sharedWith.map(s => s.userId)) {
                    await driveItem.propagateSharing(
                        userId,
                        'read',
                        queryRunner
                    );
                }
            }

            // Lưu thay đổi
            await queryRunner.manager.save(driveItem);
            await queryRunner.commitTransaction();

            // Tạo share link
            const shareLink = `${process.env.FRONTEND_URL}/share/${driveItem.shareId}`;

            return {
                success: true,
                message: `${driveItem.type.toLowerCase()} shared successfully`,
                shareLink
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(`Failed to share item: ${error.message}`);
        } finally {
            await queryRunner.release();
        }
    }

    async createFolder(createFolderDto: CreateFolderDto, user: User) {
        const { name, parentId } = createFolderDto;

        // Validate parent folder if provided
        if (parentId) {
            const parentFolder = await this.driveItemRepository.findOne({
                where: { id: parentId, ownerId: user.uid, type: DriveItemType.FOLDER }
            });
            if (!parentFolder) {
                throw new NotFoundException('Parent folder not found');
            }
        }

        try {
            // Create new folder
            const folder = new DriveItem();
            folder.name = name;
            folder.type = DriveItemType.FOLDER;
            folder.ownerId = user.uid;
            folder.parentId = parentId;
            folder.sharedWith = [];
            folder.isPublic = false;

            const savedFolder = await this.driveItemRepository.save(folder);

            // Cập nhật descendants info của parent folder nếu có
            if (parentId) {
                const parentFolder = await this.driveItemRepository.findOne({
                    where: { id: parentId }
                });
                if (parentFolder) {
                    await parentFolder.updateDescendantsInfo(this.driveItemRepository.manager.connection.createQueryRunner());
                    await this.driveItemRepository.save(parentFolder);
                }
            }

            return savedFolder;
        } catch (error) {
            throw new Error(`Failed to create folder: ${error.message}`);
        }
    }

    //===============================

    async listUserFiles(userId: string, parentId?: string) {
        try {
            const query = this.driveItemRepository.createQueryBuilder('item')
                .leftJoinAndSelect('item.form', 'form')
                .where(new Brackets(qb => {
                    qb.where('item.ownerId = :userId', { userId })
                        .orWhere(`item.sharedWith @> :sharedWith`, {
                            sharedWith: JSON.stringify([{ userId, permission: 'read' }])
                        });
                }));

            if (parentId) {
                query.andWhere('item.parentId = :parentId', { parentId });
            } else {
                query.andWhere('item.parentId IS NULL');
            }

            const items = await query
                .orderBy('item.type', 'ASC')
                .addOrderBy('item.createdAt', 'DESC')
                .getMany();

            return items;
        } catch (error) {
            console.error('Error listing items:', error);
            throw new Error(`Failed to list items: ${error.message}`);
        }
    }

    private hasReadAccess(driveItem: DriveItem, userId: string): boolean {
        if (driveItem.ownerId === userId || driveItem.isPublic) return true;

        // Kiểm tra trong mảng sharedWith
        return Array.isArray(driveItem.sharedWith) && driveItem.sharedWith.some(
            share => share.userId === userId
        );
    }

    private hasWriteAccess(driveItem: DriveItem, userId: string): boolean {
        if (driveItem.ownerId === userId) return true;

        return driveItem.sharedWith.some(
            share => share.userId === userId && share.permission === 'write'
        );
    }

    async getFileInfo(fileId: string, userId?: string) {
        const file = await this.driveItemRepository.findOne({
            where: { id: fileId },
            relations: ['form']
        });

        if (!file) {
            throw new NotFoundException('File not found');
        }

        if (file.type === DriveItemType.FILE) {
            await this.storageService.makePublic(file.storagePath)
        }

        if (!file.shareId) {
            file.shareId = crypto.randomUUID();
            await this.driveItemRepository.save(file);
        }

        // Cho phép truy cập nếu file là public
        if (file.type === DriveItemType.FORM) {
            if (file.form?.isPublic && file.form?.settings?.isPublished) {
                return file;
            }
        } else if (file.isPublic) {
            return file;
        }

        if (file.type === DriveItemType.FORM) {
            if (!userId && file.form.settings?.limitOneResponsePerUser) {
                throw new ForbiddenException('You need to log in to access this file');
            }
        } else if (!userId) {
            throw new ForbiddenException('You need to log in to access file');

            if (!this.hasReadAccess(file!, userId!)) {
                throw new ForbiddenException('You do not have permission to access this file');
            }
        }


        if (file.type === DriveItemType.FORM) return file;


        return file;
    }

    async getPreviewUrl(fileId: string, userId?: string) {
        const file = await this.getFileInfo(fileId, userId);

        // Tạo signed URL với thời hạn 1 giờ cho preview
        const url = await this.storageService.readSignedUrl(file.storagePath, {
            expires: 3600, // 1 giờ
        });

        return { url, mimeType: file.mimeType };
    }

    async getDownloadUrl(fileId: string, userId?: string) {
        const file = await this.getFileInfo(fileId, userId);

        // Tạo signed URL với thời hạn 15 phút cho download
        const url = await this.storageService.readSignedUrl(file.storagePath, {
            expires: 900, // 15 phút
            responseDisposition: `attachment; filename="${file.name}"`,
        });

        return { url, filename: file.name };
    }



    async getSharedFiles(userId: string) {
        try {
            const files = await this.driveItemRepository
                .createQueryBuilder('file')
                .where(`file.sharedWith @> :sharedWith`, {
                    sharedWith: JSON.stringify([{ userId, permission: 'read' }])
                })
                .getMany();

            return files;
        } catch (error) {
            console.error('Error getting shared files:', error);
            throw new Error(`Failed to get shared files: ${error.message}`);
        }
    }

    async getSharedFileByShareId(shareId: string, userId?: string) {
        const file = await this.driveItemRepository.findOne({
            where: { shareId }
        });

        if (!file) {
            throw new NotFoundException('Shared file not found');
        }

        // Cho phép truy cập nếu file là public
        if (file.isPublic) {
            return file;
        }

        // Kiểm tra quyền truy cập nếu file không public
        if (!userId) {
            throw new ForbiddenException('You need to log in to access this file');
        }

        const hasAccess = file.ownerId === userId ||
            (Array.isArray(file.sharedWith) && file.sharedWith.some(share => share.userId === userId));

        if (!hasAccess) {
            throw new ForbiddenException('You do not have permission to access this file');
        }

        return file;
    }

    async getUserById(userId: string) {
        return this.userRepository.findOne({
            where: { uid: userId },
            select: ['email'] // Chỉ lấy trường email
        });
    }

    async createForm(userId: string, data: CreateFormDto, parentId?: string) {
        const queryRunner = this.driveItemRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Tạo form
            const form = queryRunner.manager.create(Form, {
                ...data,
                ownerId: userId
            });
            const savedForm = await queryRunner.manager.save(Form, form);

            // Tạo drive item cho form
            const driveItem = queryRunner.manager.create(DriveItem, {
                name: data.title,
                type: DriveItemType.FORM,
                ownerId: userId,
                parentId: parentId,
                formId: savedForm.id
            });
            const savedDriveItem = await queryRunner.manager.save(DriveItem, driveItem);

            await queryRunner.commitTransaction();

            return {
                success: true,
                item: {
                    ...savedDriveItem,
                    form: savedForm
                }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(`Failed to create form: ${error.message}`);
        } finally {
            await queryRunner.release();
        }
    }

    async getFormInfo(formId: string, userId?: string) {
        const driveItem = await this.driveItemRepository.findOne({
            where: { formId },
            relations: ['form']
        });

        if (!driveItem) {
            throw new NotFoundException('Form not found');
        }

        // Cho phép truy cập nếu form là public
        if (driveItem.isPublic) {
            return driveItem;
        }

        // Kiểm tra quyền truy cập nếu form không public
        if (!userId) {
            throw new ForbiddenException('You need to log in to access this form');
        }

        if (!this.hasReadAccess(driveItem, userId)) {
            throw new ForbiddenException('You do not have permission to access this form');
        }

        return driveItem;
    }

    async getForm(formId: string, userId: string): Promise<Form> {
        const form = await this.formRepository.findOne({
            where: { id: formId },
            relations: ['owner']
        });

        if (!form) {
            throw new NotFoundException('Form not found');
        }

        const driveItem = await this.driveItemRepository.findOne({
            where: { formId },
            relations: ['form']
        });

        if (!driveItem) {
            throw new NotFoundException('Form not found');
        }

        // Kiểm tra quyền truy cập
        if (form.ownerId !== userId) {
            const hasAccess = await this.getFileInfo(driveItem.id, userId);
            if (!hasAccess) {
                throw new ForbiddenException('You do not have permission to access this form');
            }
        }

        return form;
    }

    async getDriveItemByFormId(formId: string): Promise<DriveItem> {
        const driveItem = await this.driveItemRepository.findOne({
            where: {
                formId,
                type: DriveItemType.FORM
            }
        });

        if (!driveItem) {
            throw new NotFoundException(`Drive item not found for form ${formId}`);
        }

        return driveItem;
    }

    async updateForm(
        formId: string,
        userId: string,
        updateData: Partial<Form>
    ): Promise<Form> {
        const form = await this.formRepository.findOne({
            where: { id: formId }
        });

        if (!form) {
            throw new NotFoundException('Form not found');
        }

        // Kiểm tra quyền chỉnh sửa
        if (form.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to edit this form');
        }

        // Nếu update title, cập nhật cả DriveItem
        if (updateData.title) {
            try {
                const driveItem = await this.getDriveItemByFormId(form.id);
                driveItem.name = updateData.title;
                driveItem.modifiedAt = new Date();
                await this.driveItemRepository.save(driveItem);
            } catch (error) {
                console.error('Failed to update drive item:', error);
                // Vẫn tiếp tục update form ngay cả khi không tìm thấy drive item
            }
        }

        updateData.settings = {
            ...form.settings,
            ...updateData.settings
        }

        updateData.isPublic = updateData.settings.isPublished || updateData.settings.allowAnonymous || false

        // Cập nhật form
        Object.assign(form, updateData);
        form.modifiedAt = new Date();

        return this.formRepository.save(form);
    }

    async submitFormResponse(
        formId: string,
        data: FormResponseData
    ) {
        try {
            // Tìm form và load relations cần thiết
            const form = await this.formRepository.findOne({
                where: { id: formId },
                relations: ['responses']
            });

            if (!form) {
                throw new Error('Form not found');
            }

            // Tạo response mới với FormResponse entity
            const formResponse = new FormResponse();
            formResponse.formId = formId;  // Thêm formId
            formResponse.form = form;      // Vẫn giữ relation với form
            formResponse.answers = data.answers;
            formResponse.respondentId = data.userId;
            formResponse.submittedAt = data.submittedAt;

            // Lưu response
            const savedResponse = await this.formResponseRepository.save(formResponse);

            // Khởi tạo hoặc cập nhật analytics của form

            form.analytics = {
                totalResponses: 0,
                responsesByDate: {},
                questions: {},
                averageCompletionTime: 0,
                completionRate: 0,
                ...(form.analytics ? form.analytics : {})
            };

            // Cập nhật analytics của form
            form.analytics.totalResponses++;

            // Cập nhật responses by date
            const dateKey = data.submittedAt.toISOString().split('T')[0];
            form.analytics.responsesByDate = {
                ...(form.analytics?.responsesByDate || {}),
                [dateKey]: (form.analytics?.responsesByDate?.[dateKey] || 0) + 1
            }

            // Cập nhật analytics cho từng câu hỏi
            if (form.questions) {
                for (const question of form.questions as unknown as Question[]) {
                    // Khởi tạo analytics cho câu hỏi trong form analytics
                    form.analytics.questions = form.analytics.questions || {}
                    if (!form.analytics.questions[question.id]) {
                        form.analytics.questions[question.id] = {
                            totalResponses: 0,
                            options: {},
                            skipped: 0
                        };
                    }

                    const answer = data.answers.find(a => a.questionId === question.id);
                    const questionAnalytics = form.analytics.questions[question.id];

                    if (answer) {
                        questionAnalytics.totalResponses++;

                        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'SINGLE_CHOICE') {
                            const values = Array.isArray(answer.value) ? answer.value : [answer.value];
                            const validOptions = question.options?.map(opt => opt.value) || [];

                            // Chỉ đếm các giá trị hợp lệ
                            values
                                .filter(value => validOptions.includes(value))
                                .forEach(value => {
                                    questionAnalytics.options[value] = (questionAnalytics.options[value] || 0) + 1;
                                });
                        }
                    } else {
                        questionAnalytics.skipped++;
                    }
                }
            }

            // Cập nhật responseCount của form
            form.responseCount = (form.responseCount || 0) + 1;

            console.log("form", form)
            delete (form as any).responses
            // Lưu form với analytics đã cập nhật
            await this.formRepository.save(form);

            return {
                id: savedResponse.id,
                submittedAt: savedResponse.submittedAt,
                message: form.settings?.confirmationMessage || 'Your response has been recorded.'
            };

        } catch (error) {
            throw new Error(`Failed to submit form response: ${error.message}`);
        }
    }

    async getFile(id: string, userId?: string): Promise<DriveItem> {
        try {
            // Tìm file trong database
            const file = await this.driveItemRepository.findOne({
                where: { id },
                relations: ['owner']
            });

            if (!file) {
                throw new NotFoundException('File not found');
            }

            // Kiểm tra xem file có phải là file hay không
            if (file.type === DriveItemType.FOLDER) {
                throw new BadRequestException('Item is a folder, not a file');
            }

            // Kiểm tra quyền truy cập
            const isPublic = file.isPublic || file.shareId;
            if (!isPublic) {
                // Nếu không phải file public, kiểm tra user có quyền truy cập không
                if (!userId) {
                    throw new UnauthorizedException('Authentication required');
                }

                const hasAccess = file.ownerId === userId ||
                    file.sharedWith.some(u => u.userId === userId);

                if (!hasAccess) {
                    throw new ForbiddenException('You do not have access to this file');
                }
            }

            return file;
        } catch (error) {
            console.error(`Failed to get file: ${error.message}`);
            throw error;
        }
    }

    async getFileStream(file: DriveItem): Promise<StreamResponse> {
        try {
            // Lấy signed URL từ Firebase Storage
            const url = await this.getRetriveUrl(file.id);

            // Tạo request stream từ Firebase Storage
            const response = await axios.get(url, {
                responseType: 'stream',
                headers: {
                    'Accept': file.mimeType,
                }
            });

            // Xử lý các headers quan trọng
            const contentLength = response.headers['content-length'];
            const contentType = file.mimeType || response.headers['content-type'];
            const etag = response.headers['etag'];
            const lastModified = response.headers['last-modified'];

            const headers: Record<string, string> = {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            };

            // Thêm các headers tùy chọn nếu có
            if (contentLength) headers['Content-Length'] = contentLength;
            if (etag) headers['ETag'] = etag;
            if (lastModified) headers['Last-Modified'] = lastModified;

            return {
                stream: response.data,
                headers: {
                    ...headers,
                    'Content-Type': file.mimeType
                },
                fileName: file.name,
                mimeType: file.mimeType
            };
        } catch (error) {
            console.error(`Failed to get file stream: ${error.message}`);
            throw new Error('Failed to get file stream');
        }
    }

    async getFolderPath(folderId: string, userId: string) {
        const path: { id: string; name: string }[] = [];
        let currentFolder = await this.driveItemRepository.findOne({
            where: { id: folderId, type: DriveItemType.FOLDER }
        });

        if (!currentFolder) {
            throw new NotFoundException('Folder not found');
        }

        // Check access
        if (!this.hasReadAccess(currentFolder, userId)) {
            throw new ForbiddenException('You do not have access to this folder');
        }

        // Build path from current folder up to root
        while (currentFolder) {
            path.unshift({ id: currentFolder.id, name: currentFolder.name });
            if (!currentFolder.parentId) break;

            currentFolder = await this.driveItemRepository.findOne({
                where: { id: currentFolder.parentId }
            });
        }

        return path;
    }

    async moveItem(
        itemId: string,
        targetFolderId: string | null,
        userId: string
    ): Promise<DriveItem> {
        const queryRunner = this.driveItemRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Lấy item cần move với relation parent và children
            const item = await queryRunner.manager.findOne(DriveItem, {
                where: { id: itemId },
                relations: ['parent', 'children']
            });

            if (!item) {
                throw new NotFoundException('Item not found');
            }

            // Kiểm tra quyền
            if (!this.hasWriteAccess(item, userId)) {
                throw new ForbiddenException('You do not have permission to move this item');
            }

            const oldParentId = item.parentId;
            const oldParent = item.parent;

            // Nếu có targetFolderId, kiểm tra target folder
            let targetFolder: DriveItem | null = null;
            if (targetFolderId) {
                targetFolder = await queryRunner.manager.findOne(DriveItem, {
                    where: { id: targetFolderId, type: DriveItemType.FOLDER }
                });

                if (!targetFolder) {
                    throw new NotFoundException('Target folder not found');
                }

                // Kiểm tra quyền với target folder
                if (!this.hasWriteAccess(targetFolder, userId)) {
                    throw new ForbiddenException('You do not have permission to move to this folder');
                }

                // Kiểm tra không được move vào chính nó hoặc thư mục con của nó
                if (item.type === DriveItemType.FOLDER) {
                    if (itemId === targetFolderId) {
                        throw new BadRequestException('Cannot move folder into itself');
                    }

                    const isSubfolder = await this.isSubfolder(itemId, targetFolderId);
                    if (isSubfolder) {
                        throw new BadRequestException('Cannot move folder into its subfolder');
                    }
                }

                item.parent = targetFolder;
            }

            item.modifiedAt = new Date();
            await queryRunner.manager.save(item);

            // Cập nhật thông tin descendants cho old parent
            if (oldParent) {
                await oldParent.updateDescendantsInfo(queryRunner);
                await queryRunner.manager.save(oldParent);
            }

            // Cập nhật thông tin descendants cho new parent
            if (targetFolder) {
                await targetFolder.updateDescendantsInfo(queryRunner);
                await queryRunner.manager.save(targetFolder);
            }

            // Nếu item là folder, cập nhật sharing permissions cho descendants
            if (item.type === DriveItemType.FOLDER) {
                // Xóa sharing permissions từ old parent
                if (oldParent) {
                    for (const share of oldParent.sharedWith) {
                        if (share.inheritedFrom === oldParent.id) {
                            await item.removeSharing(share.userId, queryRunner);
                        }
                    }
                }

                // Thêm sharing permissions từ new parent
                if (targetFolder) {
                    for (const share of targetFolder.sharedWith) {
                        await item.propagateSharing(
                            share.userId,
                            share.permission,
                            queryRunner
                        );
                    }
                }

                // Cập nhật lại descendants info sau khi thay đổi sharing
                await item.updateDescendantsInfo(queryRunner);
                await queryRunner.manager.save(item);
            }

            await queryRunner.commitTransaction();
            return item;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Kiểm tra xem một folder có phải là subfolder của một folder khác không
     * @param parentId ID của folder cha tiềm năng
     * @param childId ID của folder con tiềm năng
     * @returns true nếu childId là subfolder của parentId
     */
    async isSubfolder(parentId: string, childId: string): Promise<boolean> {
        // Nếu 2 ID giống nhau thì không phải là subfolder
        if (parentId === childId) {
            return false;
        }

        try {
            // Lấy thông tin folder con
            const childFolder = await this.driveItemRepository.findOne({
                where: { id: childId }
            });

            if (!childFolder) {
                return false;
            }

            // Lấy thông tin folder cha
            const parentFolder = await this.driveItemRepository.findOne({
                where: { id: parentId }
            });

            if (!parentFolder) {
                return false;
            }

            // Kiểm tra xem parentId có nằm trong descendantIds của childFolder không
            if (childFolder.descendantIds.includes(parentId)) {
                return true;
            }

            // Nếu folder con không có descendantIds, kiểm tra theo cách thông thường
            let currentFolder: DriveItem | null = childFolder;
            while (currentFolder.parentId) {
                if (currentFolder.parentId === parentId) {
                    return true;
                }
                currentFolder = await this.driveItemRepository.findOne({
                    where: { id: currentFolder.parentId }
                });

                if (!currentFolder) {
                    break;
                }
            }

            return false;

        } catch (error) {
            throw new Error('Failed to check folder relationship');
        }
    }

    /**
     * Lấy tất cả ancestor folders của một folder
     * @param folderId ID của folder cần tìm ancestors
     * @returns Mảng các ancestor folders theo thứ tự từ gần đến xa
     */
    private async getAncestors(folderId: string): Promise<DriveItem[]> {
        const ancestors: DriveItem[] = [];
        let currentFolder = await this.driveItemRepository.findOne({
            where: { id: folderId }
        });

        while (currentFolder?.parentId) {
            const parent = await this.driveItemRepository.findOne({
                where: { id: currentFolder.parentId }
            });
            if (parent) {
                ancestors.push(parent);
                currentFolder = parent;
            } else {
                break;
            }
        }

        return ancestors;
    }
} 