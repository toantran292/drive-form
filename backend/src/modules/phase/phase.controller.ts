import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  Headers,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PhaseService } from './phase.service';
import { CreatePhaseDto, UpdatePhaseDto } from './phase.dto';
import { CreateFormDto } from '../form/form.dto';
import { Form } from '../../entities/form.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('phases')
@UseGuards(AuthGuard)
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Post()
  async createPhase(@Body() createPhaseDto: CreatePhaseDto) {
    return this.phaseService.createPhase(createPhaseDto);
  }

  @Get('/:formId')
  async getPhases(@Param('formId') formId: string) {
    return this.phaseService.getPhases(formId);
  }

  @Get(':id/forms')
  async getPhaseById(@Param('id') id: string) {
    return this.phaseService.getPhaseById(id);
  }

  @Post(':phaseId/forms')
  async createFormForPhase(
    @Param('phaseId') phaseId: string,
    @Body() body: CreateFormDto,
    @Request() req,
  ) {
    console.log(req.user);
    return this.phaseService.createFormUnderPhase(req.user.uid, body, phaseId);
  }

  @Get('forms/:id')
  async getForm(@Param('id') formId: string, @Request() req): Promise<Form> {
    try {
      const form = await this.phaseService.getForm(formId, req.user.uid);

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

  @Patch('/forms/:formId')
  async updateFormInPhase(
    // @Param('phaseId') phaseId: string,
    @Param('formId') formId: string,
    @Body() body: Partial<Form>,
    @Request() req,
  ) {
    return this.phaseService.updateFormInPhase(req.user.uid, body, formId);
  }

  @Patch(':id')
  async updatePhase(
    @Param('id') id: string,
    @Body() updatePhaseDto: UpdatePhaseDto,
  ) {
    return this.phaseService.updatePhase(id, updatePhaseDto);
  }

  @Delete(':id')
  async deletePhase(@Param('id') id: string) {
    return this.phaseService.deletePhase(id);
  }

  @Get(':id/responses')
  async getPhaseResponses(@Param('id') id: string) {
    return this.phaseService.getPhaseResponses(id);
  }
}
