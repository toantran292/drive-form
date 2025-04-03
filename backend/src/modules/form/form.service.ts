import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form, FormResponse } from '../../entities/form.entity';
import { CreateFormDto, UpdateFormDto } from './form.dto';
import { Phase } from '../../entities/phase.entity';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
    @InjectRepository(FormResponse)
    private formResponseRepository: Repository<FormResponse>,

    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
  ) {}

  async createForm(userId: string, createFormDto: CreateFormDto) {
    const form = this.formRepository.create({
      ...createFormDto,
      ownerId: userId,
    });
    return this.formRepository.save(form);
  }

  async getForms(userId: string) {
    return this.formRepository.find({
      where: [{ ownerId: userId }, { sharedWith: { userId } }],
      order: { modifiedAt: 'DESC' },
    });
  }

  async getForm(id: string, userId?: string) {
    const form = await this.formRepository.findOne({
      where: { id },
      relations: ['respondent'],
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.isActive) {
      throw new ForbiddenException('Form is not active');
    }

    if (
      userId &&
      form.ownerId !== userId &&
      !form.sharedWith.some((share) => share.userId === userId)
    ) {
      throw new ForbiddenException('You do not have access to this form');
    }

    return form;
  }

  async updateForm(id: string, userId: string, updateFormDto: UpdateFormDto) {
    const form = await this.getForm(id, userId);

    if (
      form.ownerId !== userId &&
      !form.sharedWith.some(
        (share) => share.userId === userId && share.permission === 'edit',
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to edit this form',
      );
    }

    Object.assign(form, updateFormDto);
    return this.formRepository.save(form);
  }

  async deleteForm(id: string, userId: string) {
    const form = await this.getForm(id, userId);

    if (form.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete this form');
    }

    await this.formRepository.remove(form);
    return { success: true };
  }

  async shareForm(
    id: string,
    ownerId: string,
    userId: string,
    permission: 'view' | 'edit',
  ) {
    const form = await this.getForm(id, ownerId);

    if (form.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can share this form');
    }

    form.sharedWith = [
      ...form.sharedWith.filter((share) => share.userId !== userId),
      { userId, permission },
    ];

    return this.formRepository.save(form);
  }

  async submitForm(
    id: string,
    answers: { questionId: string; value: string | string[] }[],
  ) {
    const form = await this.getForm(id);

    // Validate answers
    const validQuestionIds = form.questions.map((q) => q.id);
    const invalidAnswers = answers.filter(
      (a) => !validQuestionIds.includes(a.questionId),
    );
    if (invalidAnswers.length > 0) {
      throw new ForbiddenException('Invalid question IDs in answers');
    }

    // Check required questions
    const requiredQuestions = form.questions.filter((q) => q.required);
    const missingRequired = requiredQuestions.filter(
      (q) =>
        !answers.some(
          (a) => a.questionId === q.id && a.value !== '' && a.value.length > 0,
        ),
    );
    if (missingRequired.length > 0) {
      throw new ForbiddenException('Missing answers for required questions');
    }

    const response = this.formResponseRepository.create({
      formId: id,
      answers,
    });

    return this.formResponseRepository.save(response);
  }

  async getFormResponses(id: string, userId: string) {
    const form = await this.getForm(id, userId);

    if (
      form.ownerId !== userId &&
      !form.sharedWith.some((share) => share.userId === userId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to view responses',
      );
    }

    return this.formResponseRepository.find({
      where: { formId: id },
      relations: ['user', 'form'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFormResponseById(responseId: string, userId: string) {
    const response = await this.formResponseRepository.findOne({
      where: { id: responseId },
      relations: ['form'],
    });

    if (!response) {
      throw new NotFoundException('Không tìm thấy phản hồi');
    }

    const form = response.form;

    const isOwner = form.ownerId === userId;
    const isShared = form.sharedWith?.some((share) => share.userId === userId);

    if (!isOwner && !isShared) {
      throw new ForbiddenException('Bạn không có quyền xem phản hồi này');
    }

    return response;
  }
}
