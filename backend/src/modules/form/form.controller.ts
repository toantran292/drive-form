import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FormService } from './form.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateFormDto, UpdateFormDto } from './form.dto';
import { Request } from 'express';
import { IsPublic } from 'src/decorators/is-public.decorator';

@Controller('forms')
@UseGuards(AuthGuard)
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  async createForm(@Req() req: Request, @Body() createFormDto: CreateFormDto) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.formService.createForm(req.user.uid, createFormDto);
  }

  @Get()
  async getForms(@Req() req: Request) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.formService.getForms(req.user.uid);
  }

  @Get(':id')
  async getForm(@Req() req: Request, @Param('id') id: string) {
    return this.formService.getForm(id, req.user?.uid);
  }

  @Put(':id')
  async updateForm(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.formService.updateForm(id, req.user.uid, updateFormDto);
  }

  @Delete(':id')
  async deleteForm(@Req() req: Request, @Param('id') id: string) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.formService.deleteForm(id, req.user.uid);
  }

  @Post(':id/share')
  async shareForm(
    @Req() req: Request,
    @Param('id') id: string,
    @Body()
    { userId, permission }: { userId: string; permission: 'view' | 'edit' },
  ) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.formService.shareForm(id, req.user.uid, userId, permission);
  }

  @IsPublic()
  @Post(':id/submit')
  async submitForm(
    @Param('id') id: string,
    @Body()
    {
      answers,
    }: { answers: { questionId: string; value: string | string[] }[] },
  ) {
    return this.formService.submitForm(id, answers);
  }

  @Get(':id/responses')
  async getFormResponses(@Req() req: Request, @Param('id') id: string) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.formService.getFormResponses(id, req.user.uid);
  }

  @Get(':id/responses/:responseId') // ✅ đúng chính tả
  async getFormResponseById(
    @Req() req,
    @Param('id') id: string,
    @Param('responseId') responseId: string,
  ) {
    if (!req.user) {
      throw new Error('User not found');
    }
    return this.formService.getFormResponseById(responseId, req.user.uid); // ✅ truyền đúng tham số
  }
}
