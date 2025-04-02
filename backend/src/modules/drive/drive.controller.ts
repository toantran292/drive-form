import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
  Res,
  UseGuards,
  Request,
  Query,
  Body,
  BadRequestException,
  Patch,
  NotFoundException,
  InternalServerErrorException,
  Header,
  Req,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DriveService } from './drive.service';
import { AuthGuard } from '../auth/auth.guard';
import { DriveItemType, DriveItem } from '../../entities/drive-item.entity';
import { ShareFileDto, ShareResponse } from './drive.service';
import { IsPublic } from '../../decorators/is-public.decorator';
import { CreateFormDto } from '../form/form.dto';
import { Form, QuestionType } from '../../entities/form.entity';
import { Logger } from '@nestjs/common';
import { CreateFolderDto } from './drive.dto';
import { User } from 'src/entities/user.entity';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('drive')
@UseGuards(AuthGuard)
export class DriveController {
  private readonly logger = new Logger(DriveController.name);

  constructor(private readonly driveService: DriveService) {}

  @Post('get-upload-url')
  async getUploadUrl(
    @Request() req,
    @Body() body: MulterFile,
    @Query('parentId') parentId?: string,
  ) {
    try {
      const { url, path } = await this.driveService.getUploadUrl(
        req.user.uid,
        body,
      );
      return {
        success: true,
        url,
        path,
      };
    } catch (error) {
      throw new Error(`Failed to get upload URL: ${error.message}`);
    }
  }

  @Post('save-file')
  async saveFile(
    @Request() req,
    @Body()
    fileInfo: {
      fieldname: string;
      originalname: string;
      mimetype: string;
      size: number;
      encoding: string;
      storagePath: string;
    },
    @Query('parentId') parentId?: string,
  ) {
    try {
      const result = await this.driveService.saveFile(
        fileInfo,
        fileInfo.storagePath,
        req.user.uid,
        parentId,
      );
      return {
        success: true,
        file: {
          id: result.file.id,
          name: result.file.name,
          type: result.file.type.toLowerCase(),
          mimeType: result.file.mimeType,
          size: result.file.size,
          downloadUrl: result.file.downloadUrl,
          createdAt: result.file.createdAt,
          modifiedAt: result.file.modifiedAt,
          ownerId: result.file.ownerId,
          parentId: result.file.parentId,
          isFolder: result.file.type === DriveItemType.FOLDER,
          thumbnail: this.getThumbnailUrl(result.file),
        },
      };
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  @Delete('files/:id')
  async deleteFile(@Param('id') fileId: string, @Request() req) {
    try {
      await this.driveService.deleteFile(fileId, req.user.uid);
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // @Get('files/:path')
  // async streamFile(
  //     @Param('path') path: string,
  //     @Request() req,
  //     @Res() res: Response
  // ) {
  //     try {
  //         const stream = await this.driveService.getFileStream(path, req.user.uid);
  //         stream.pipe(res);
  //     } catch (error) {
  //         throw new Error(`Failed to stream file: ${error.message}`);
  //     }
  // }

  // @Get('files/:path/signed-url')
  // async getSignedUrl(
  //     @Param('path') path: string,
  //     @Request() req
  // ) {
  //     try {
  //         const url = await this.driveService.generateSignedUrl(path, req.user.uid);
  //         return { url };
  //     } catch (error) {
  //         throw new Error(`Failed to generate signed URL: ${error.message}`);
  //     }
  // }

  @Get('files')
  async listFiles(@Request() req, @Query('parentId') parentId?: string) {
    try {
      const items = await this.driveService.listUserFiles(
        req.user.uid,
        parentId,
      );
      return items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type.toLowerCase(),
        mimeType: item.mimeType,
        size: item.size,
        downloadUrl: item.downloadUrl,
        createdAt: item.createdAt,
        modifiedAt: item.modifiedAt,
        ownerId: item.ownerId,
        parentId: item.parentId,
        isFolder: item.type === DriveItemType.FOLDER,
        isForm: item.type === DriveItemType.FORM,
        formId: item.formId,
        form: item.form,
        icon: this.getFileIcon(item),
        thumbnail: this.getThumbnailUrl(item),
      }));
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  @Get('files/:id')
  async getFile(@Param('id') fileId: string, @Request() req) {
    try {
      const file = await this.driveService.getFileInfo(fileId, req.user.uid);
      return {
        id: file.id,
        name: file.name,
        type: file.type.toLowerCase(),
        mimeType: file.mimeType,
        size: file.size,
        downloadUrl: file.downloadUrl,
        createdAt: file.createdAt,
        modifiedAt: file.modifiedAt,
        ownerId: file.ownerId,
        parentId: file.parentId,
        isFolder: file.type === DriveItemType.FOLDER,
        thumbnail: this.getThumbnailUrl(file),
      };
    } catch (error) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  @Get('files/:id/preview')
  @IsPublic()
  async previewFile(@Param('id') fileId: string, @Request() req) {
    try {
      const userId = req.user?.uid; // Optional: người dùng có thể đã đăng nhập hoặc chưa
      const { url, mimeType } = await this.driveService.getPreviewUrl(
        fileId,
        userId,
      );
      return {
        success: true,
        url,
        mimeType,
        isPreviewable: this.isPreviewableFile(mimeType),
      };
    } catch (error) {
      throw new Error(`Failed to get preview URL: ${error.message}`);
    }
  }

  @Get('files/:id/download')
  @IsPublic()
  async downloadFile(@Param('id') fileId: string, @Request() req) {
    try {
      const userId = req.user?.uid; // Optional: người dùng có thể đã đăng nhập hoặc chưa
      const { url, filename } = await this.driveService.getDownloadUrl(
        fileId,
        userId,
      );
      return {
        success: true,
        url,
        filename,
      };
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }

  @Post(':id/share')
  async shareFile(
    @Param('id') id: string,
    @Body() shareData: ShareFileDto,
    @Request() req,
  ): Promise<ShareResponse> {
    return this.driveService.shareFile(id, req.user.uid, shareData);
  }

  @Get('share/:shareId')
  @IsPublic()
  async getSharedFile(@Param('shareId') shareId: string, @Request() req) {
    try {
      const userId = req.user?.uid; // Optional: người dùng có thể đã đăng nhập hoặc chưa
      const file = await this.driveService.getSharedFileByShareId(
        shareId,
        userId,
      );

      // Lấy URL xem trước và tải xuống
      const { url: previewUrl } = await this.driveService.getPreviewUrl(
        file.id,
        userId,
      );
      const { url: downloadUrl } = await this.driveService.getDownloadUrl(
        file.id,
        userId,
      );

      return {
        success: true,
        file: {
          id: file.id,
          name: file.name,
          type: file.type.toLowerCase(),
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdAt,
          modifiedAt: file.modifiedAt,
          ownerId: file.ownerId,
          isPublic: file.isPublic,
        },
        previewUrl,
        downloadUrl,
      };
    } catch (error) {
      throw new BadRequestException(
        `You don't have permission to access this file`,
      );
    }
  }

  @Get('shared')
  async getSharedFiles(@Request() req) {
    return this.driveService.getSharedFiles(req.user.uid);
  }

  @Get(':id/share')
  async getShareInfo(@Param('id') id: string, @Request() req) {
    const file = await this.driveService.getFileInfo(id, req.user.uid);

    // Lấy danh sách email của những người được share
    const sharedEmails = await Promise.all(
      file.sharedWith.map(async (share) => {
        const user = await this.driveService.getUserById(share.userId);
        return user?.email;
      }),
    );

    // Lọc bỏ undefined (trường hợp user không tồn tại)
    const validEmails = sharedEmails.filter((email) => email) as string[];

    return {
      isPublic: file.isPublic,
      shareLink: `${process.env.FRONTEND_URL}/share/${file.shareId}`,
      sharedWith: validEmails,
    };
  }

  @Post('forms')
  async createForm(
    @Request() req,
    @Body() createFormDto: CreateFormDto,
    @Query('parentId') parentId?: string,
  ) {
    try {
      const { item } = await this.driveService.createForm(
        req.user.uid,
        createFormDto,
        parentId,
      );
      return {
        success: true,
        item: {
          id: item.id,
          name: item.name,
          type: item.type.toLowerCase(),
          mimeType: item.mimeType,
          size: item.size,
          downloadUrl: item.downloadUrl,
          createdAt: item.createdAt,
          modifiedAt: item.modifiedAt,
          ownerId: item.ownerId,
          parentId: item.parentId,
          isFolder: item.type === DriveItemType.FOLDER,
          isForm: item.type === DriveItemType.FORM,
          formId: item.formId,
          form: item.form,
          icon: this.getFileIcon(item as DriveItem),
          thumbnail: this.getThumbnailUrl(item as DriveItem),
        },
      };
    } catch (error) {
      throw new Error(`Failed to create form: ${error.message}`);
    }
  }

  @Get('forms/:id')
  async getForm(@Param('id') formId: string, @Request() req): Promise<Form> {
    try {
      const form = await this.driveService.getForm(formId, req.user.uid);

      if (!form) {
        throw new BadRequestException('Form not found');
      }

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        phaseId: form.phaseId,
        questions: form.questions || [],
        settings: form.settings || {
          collectEmail: false,
          limitToOneResponse: false,
          showProgressBar: true,
          shuffleQuestions: false,
          confirmationMessage: 'Phản hồi của bạn đã được gửi.',
          theme: {
            color: '#1a73e8',
            font: 'Default',
          },
        },
        createdAt: form.createdAt,
        modifiedAt: form.modifiedAt,
        ownerId: form.ownerId,
        owner: form.owner,
        isPublic: form.isPublic || false,
        shareId: form.shareId,
        sharedWith: form.sharedWith || [],
        isActive: form.isActive ?? true,
        responseCount: form.responseCount ?? 0,
        responses: form.responses || [],
        analytics: form.analytics || {},
        phase: form.phase || { id: 'default-phase-id', name: 'Default' },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get form: ${error.message}`);
    }
  }

  @Patch('forms/:id')
  async updateForm(
    @Param('id') formId: string,
    @Body() updateData: Partial<Form>,
    @Request() req,
  ) {
    try {
      const updatedForm = await this.driveService.updateForm(
        formId,
        req.user.uid,
        updateData,
      );

      // Nếu update title, lấy thêm thông tin DriveItem
      let driveItem: DriveItem | null = null;
      if (updateData.title) {
        try {
          driveItem = await this.driveService.getDriveItemByFormId(formId);
        } catch (error) {
          console.error('Failed to get drive item:', error);
        }
      }

      return {
        success: true,
        form: updatedForm,
        driveItem: driveItem
          ? {
              id: driveItem.id,
              name: driveItem.name,
              type: DriveItemType.FORM,
              formId: driveItem.formId,
              createdAt: driveItem.createdAt,
              modifiedAt: driveItem.modifiedAt,
              ownerId: driveItem.ownerId,
              parentId: driveItem.parentId,
            }
          : null,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to update form: ${error.message}`);
    }
  }

  @Get('forms/:id/view')
  @IsPublic()
  async viewForm(@Param('id') formId: string, @Request() req) {
    try {
      const userId = req.user?.uid;
      const form = await this.driveService.getForm(formId, userId);

      if (!form) {
        throw new BadRequestException('Form not found');
      }
      // Kiểm tra form có được publish không
      if (!form.isPublic) {
        throw new BadRequestException('This form is not available');
      }

      // Kiểm tra form có đang active không
      if (!form.isActive) {
        throw new BadRequestException(
          'This form is no longer accepting responses',
        );
      }

      const settings = form.settings;

      if (!settings) {
        throw new BadRequestException('Form settings not found');
      }

      const {
        collectEmail,
        limitOneResponsePerUser,
        showProgressBar,
        shuffleQuestions,
        confirmationMessage,
        theme,
        isPublished,
        acceptingResponses,
        allowAnonymous,
      } = settings;

      let canSubmit = true;
      let message = '';

      if (collectEmail || limitOneResponsePerUser) {
        if (!userId) {
          canSubmit = false;
          message = 'Please sign in to submit this form';
        }
      }

      if (form.settings?.limitOneResponsePerUser) {
        if (userId) {
          // Nếu user đã đăng nhập, kiểm tra xem đã submit chưa
          const hasResponded = form.responses?.some(
            (response) => response.respondentId === userId,
          );
          if (hasResponded) {
            canSubmit = false;
            message = 'You have already submitted a response to this form';
          }
        }
      }

      // Chỉ trả về các thông tin cần thiết cho việc xem và điền form
      if (!canSubmit) {
        return {
          id: form.id,
          title: form.title,
          description: form.description,
          message: message,
        };
      }

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        questions: form.questions || [],
        settings: {
          collectEmail: form.settings?.collectEmail || false,
          limitToOneResponse: form.settings?.limitOneResponsePerUser || false,
          showProgressBar: form.settings?.showProgressBar || true,
          shuffleQuestions: form.settings?.shuffleQuestions || false,
          confirmationMessage:
            form.settings?.confirmationMessage ||
            'Your response has been recorded.',
          theme: form.settings?.theme || {
            color: '#1a73e8',
            font: 'Default',
          },
          isPublished: form.settings?.isPublished || false,
          acceptingResponses: form.settings?.acceptingResponses || true,
          allowAnonymous: form.settings?.allowAnonymous || false,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('forms/:id/responses')
  @IsPublic()
  async submitFormResponse(
    @Param('id') formId: string,
    @Body()
    response: {
      answers: Array<{
        questionId: string;
        value: string | string[];
      }>;
      respondentEmail?: string;
    },
    @Request() req,
  ) {
    try {
      const userId = req.user?.uid;
      const form = await this.driveService.getForm(formId, userId);

      if (!form) {
        throw new BadRequestException('Form not found');
      }

      // Kiểm tra form có public không
      if (!form.isPublic || !form.settings.isPublished) {
        throw new BadRequestException('This form is not available');
      }

      // Kiểm tra form có active không
      if (!form.isActive) {
        throw new BadRequestException(
          'This form is no longer accepting responses',
        );
      }

      // Kiểm tra limitOneResponsePerUser
      if (form.settings?.limitOneResponsePerUser) {
        if (userId) {
          const hasResponded = form.responses?.some(
            (response) => response.respondentId === userId,
          );
          if (hasResponded) {
            throw new BadRequestException(
              'You have already submitted a response to this form',
            );
          }
        } else {
          throw new BadRequestException('Please sign in to submit this form');
        }
      }

      // Kiểm tra collectEmail
      if (form.settings?.collectEmail && !req.user?.email) {
        throw new BadRequestException('Email is required');
      }

      // Tạo map các câu hỏi để truy cập nhanh hơn
      const questionsMap = new Map(form.questions?.map((q) => [q.id, q]) || []);

      for (const answer of response.answers) {
        const question = questionsMap.get(answer.questionId);
        if (!question) {
          throw new BadRequestException(
            `Invalid question ID: ${answer.questionId}`,
          );
        }

        // Tạo Set của các option IDs hợp lệ (nếu là câu hỏi có options)
        const validOptionIds =
          question.type === QuestionType.MULTIPLE_CHOICE ||
          question.type === QuestionType.SINGLE_CHOICE
            ? new Set(question.options?.map((opt) => (opt as any).id))
            : null;

        switch (question.type) {
          case QuestionType.MULTIPLE_CHOICE:
            if (!Array.isArray(answer.value)) {
              throw new BadRequestException(
                `Invalid answer format for multiple choice question "${question.title}"`,
              );
            }

            // Kiểm tra tất cả các id được chọn có hợp lệ không
            const invalidIds = answer.value.filter(
              (id) => !validOptionIds?.has(id),
            );
            if (invalidIds.length > 0) {
              throw new BadRequestException(
                `Invalid option IDs selected for question "${question.title}": ${invalidIds.join(', ')}`,
              );
            }
            break;

          case QuestionType.SINGLE_CHOICE:
            if (Array.isArray(answer.value)) {
              throw new BadRequestException(
                `Invalid answer format for single choice question "${question.title}"`,
              );
            }

            // Kiểm tra id được chọn có hợp lệ không
            if (!validOptionIds?.has(answer.value)) {
              throw new BadRequestException(
                `Invalid option ID selected for question "${question.title}": ${answer.value}`,
              );
            }
            break;

          case QuestionType.TEXT:
          case QuestionType.PARAGRAPH:
            if (Array.isArray(answer.value)) {
              throw new BadRequestException(
                `Invalid answer format for text question "${question.title}"`,
              );
            }

            // Validate độ dài text nếu cần
            if (typeof answer.value !== 'string') {
              throw new BadRequestException(
                `Answer must be a string for text question "${question.title}"`,
              );
            }

            // Có thể thêm validate độ dài
            if (answer.value.length > 10000) {
              // Ví dụ giới hạn 10000 ký tự
              throw new BadRequestException(
                `Answer too long for question "${question.title}". Maximum length is 10000 characters`,
              );
            }
            break;
        }
      }

      // Submit response
      const formResponse = await this.driveService.submitFormResponse(formId, {
        answers: response.answers,
        email: req.user.email,
        userId,
        submittedAt: new Date(),
      });

      return {
        success: true,
        message:
          form.settings?.confirmationMessage ||
          'Your response has been recorded.',
        responseId: formResponse.id,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // @Post('forms/:id/publish')
  // async publishForm(
  //     @Param('id') formId: string,
  //     @Body() publishSettings: any,
  //     @Request() req
  // ) {
  //     try {
  //         const form = await this.driveService.publishForm(
  //             formId,
  //             req.user.uid,
  //             publishSettings
  //         );

  //         return {
  //             success: true,
  //             form,
  //             publishUrl: `${process.env.FRONTEND_URL}/forms/${formId}/view`
  //         };
  //     } catch (error) {
  //         throw new BadRequestException(`Failed to publish form: ${error.message}`);
  //     }
  // }

  // @Post('forms/:id/unpublish')
  // async unpublishForm(
  //     @Param('id') formId: string,
  //     @Request() req
  // ) {
  //     try {
  //         const form = await this.driveService.unpublishForm(formId, req.user.uid);
  //         return {
  //             success: true,
  //             form
  //         };
  //     } catch (error) {
  //         throw new BadRequestException(`Failed to unpublish form: ${error.message}`);
  //     }
  // }

  @Post('folders')
  async createFolder(@Body() createFolderDto: CreateFolderDto, @Req() req) {
    try {
      const folder = await this.driveService.createFolder(
        createFolderDto,
        req.user,
      );
      return {
        success: true,
        folder: {
          id: folder.id,
          name: folder.name,
          type: folder.type.toLowerCase(),
          createdAt: folder.createdAt,
          modifiedAt: folder.modifiedAt,
          ownerId: folder.ownerId,
          parentId: folder.parentId,
          isFolder: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('folders/:id/path')
  async getFolderPath(@Param('id') folderId: string, @Request() req) {
    try {
      const path = await this.driveService.getFolderPath(
        folderId,
        req.user.uid,
      );
      return {
        success: true,
        path,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        path: [],
      };
    }
  }

  @Post('items/:itemId/move')
  async moveItem(
    @Param('itemId') itemId: string,
    @Body() body: { targetFolderId: string | null },
    @Request() req,
  ) {
    try {
      // Kiểm tra item tồn tại và user có quyền
      const item = await this.driveService.getFileInfo(itemId, req.user.uid);
      if (!item) {
        throw new NotFoundException('Item not found');
      }

      // Kiểm tra target folder tồn tại và user có quyền
      if (body.targetFolderId) {
        const targetFolder = await this.driveService.getFileInfo(
          body.targetFolderId,
          req.user.uid,
        );

        if (!targetFolder) {
          throw new NotFoundException('Target folder not found');
        }

        if (targetFolder.type !== DriveItemType.FOLDER) {
          throw new BadRequestException('Target must be a folder');
        }

        // Kiểm tra không được move vào chính nó hoặc thư mục con của nó
        if (itemId === body.targetFolderId) {
          throw new BadRequestException('Cannot move folder into itself');
        }

        // Kiểm tra không được move vào thư mục con
        const isSubfolder = await this.driveService.isSubfolder(
          itemId,
          body.targetFolderId,
        );
        if (isSubfolder) {
          throw new BadRequestException(
            'Cannot move folder into its subfolder',
          );
        }
      }

      // Thực hiện move
      const movedItem = await this.driveService.moveItem(
        itemId,
        body.targetFolderId,
        req.user.uid,
      );

      return {
        success: true,
        item: {
          id: movedItem.id,
          name: movedItem.name,
          type: movedItem.type.toLowerCase(),
          mimeType: movedItem.mimeType,
          size: movedItem.size,
          downloadUrl: movedItem.downloadUrl,
          createdAt: movedItem.createdAt,
          modifiedAt: movedItem.modifiedAt,
          ownerId: movedItem.ownerId,
          parentId: movedItem.parentId,
          isFolder: movedItem.type === DriveItemType.FOLDER,
          isForm: movedItem.type === DriveItemType.FORM,
          formId: movedItem.formId,
          form: movedItem.form,
          icon: this.getFileIcon(movedItem),
          thumbnail: this.getThumbnailUrl(movedItem),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to move item: ${error.message}`,
      );
    }
  }

  private getThumbnailUrl(file: DriveItem): string | null {
    if (file.type === DriveItemType.FOLDER) {
      return null;
    }

    if (file.mimeType?.startsWith('image/')) {
      return file.downloadUrl;
    }

    // Return null for non-image files
    return null;
  }

  private isPreviewableFile(mimeType: string): boolean {
    const previewableMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];
    return previewableMimeTypes.includes(mimeType);
  }

  private getFileIcon(item: DriveItem): string {
    if (item.type === DriveItemType.FOLDER) {
      return 'folder';
    }
    if (item.type === DriveItemType.FORM) {
      return 'form';
    }
    if (item.mimeType?.startsWith('image/')) {
      return 'image';
    }
    switch (item.mimeType) {
      case 'application/pdf':
        return 'pdf';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'word';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'excel';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'powerpoint';
      default:
        return 'file';
    }
  }
}
