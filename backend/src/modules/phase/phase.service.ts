// phase.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Phase } from '../../entities/phase.entity';
import { Form, FormResponse } from '../../entities/form.entity';
import { CreatePhaseDto, UpdatePhaseDto } from './phase.dto';
import { User } from '../../entities/user.entity';
import { FormService } from '../form/form.service';
import { CreateFormDto } from '../form/form.dto';
import { DriveService } from '../drive/drive.service';

@Injectable()
export class PhaseService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,

    @InjectRepository(Form)
    private formRepository: Repository<Form>,

    @InjectRepository(FormResponse)
    private formResponseRepository: Repository<FormResponse>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private formService: FormService,
    private driveService: DriveService,
  ) {}

  // Tạo phase
  async createPhase(createPhaseDto: CreatePhaseDto) {
    const phase = this.phaseRepository.create(createPhaseDto);
    return this.phaseRepository.save(phase);
  }

  async getPhases(formId: string) {
    const phase = await this.formRepository.find({
      where: { id: formId },
    });

    // Lấy tất cả respondentId từ responses, loại bỏ null/undefined nếu có
    const responseUser = phase[0].responses
      .map((item) => item.respondentId)
      .filter((id): id is string => id !== null && id !== undefined);

    // Tìm tất cả user tương ứng bằng respondentId
    const userRecords = await Promise.all(
      responseUser.map(async (respondentId) => {
        return await this.userRepository.findOne({
          where: { uid: respondentId },
        });
      }),
    );

    // Loại bỏ các giá trị null nếu không tìm thấy user nào
    const validUsers = userRecords.filter((user) => user !== null);

    console.log(validUsers);
    return { userRecords: validUsers, formId };
  }

  // Lấy phase theo ID
  async getPhaseById(id: string) {
    const phase = await this.phaseRepository.findOne({
      where: { id },
      relations: ['forms', 'project'],
    });
    if (!phase) {
      throw new NotFoundException('Phase not found');
    }
    return phase;
  }

  async getForm(formId: string, userId: string): Promise<Form> {
    const form = await this.formRepository.findOne({
      where: { id: formId },
      relations: ['owner', 'responses', 'phase'],
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const driveItem = await this.phaseRepository.findOne({
      where: { id: formId },
      relations: ['forms'],
    });

    // if (!driveItem) {
    //   throw new NotFoundException('Form not found');
    // }
    //
    // // Kiểm tra quyền truy cập
    // if (form.ownerId !== userId) {
    //   const hasAccess = await this.getFileInfo(driveItem.id, userId);
    //   if (!hasAccess) {
    //     throw new ForbiddenException(
    //         'You do not have permission to access this form',
    //     );
    //   }
    // }

    return form;
  }
  async updateFormInPhase(
    userId: string,
    updateFormDto: Partial<Form>,
    formId: string,
  ) {
    // const phase = await this.phaseRepository.findOne({ where: { id: phaseId } });
    // if (!phase) throw new NotFoundException('Phase not found');

    const form = await this.formRepository.findOne({
      where: { id: formId },
      relations: ['phase'],
    });

    if (!form) throw new NotFoundException('Form not found');

    //   throw new BadRequestException('Form does not belong to this phase');`

    const updated = await this.driveService.updateForm(
      formId,
      userId,
      updateFormDto,
    );

    return {
      success: true,
      form: updated,
    };
  }

  // Cập nhật phase
  async updatePhase(id: string, updatePhaseDto: UpdatePhaseDto) {
    const phase = await this.getPhaseById(id);
    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    Object.assign(phase, updatePhaseDto);
    return this.phaseRepository.save(phase);
  }

  // Xóa phase
  async deletePhase(id: string) {
    const phase = await this.getPhaseById(id);
    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    await this.phaseRepository.remove(phase);
    return { success: true, message: 'Phase deleted successfully' };
  }

  async createFormUnderPhase(
    userId: string,
    createFormDto: CreateFormDto,
    phaseId: string,
  ) {
    if (!phaseId) {
      throw new NotFoundException('Missing phaseId');
    }

    const phase = await this.phaseRepository.findOne({
      where: { id: phaseId },
    });
    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    createFormDto.phaseId = phaseId;

    return this.driveService.createForm(userId, createFormDto);
  }

  // Lấy phản hồi của phase
  async getPhaseResponses(formId: string) {
    const responses = await this.formResponseRepository.find({
      where: { formId },
      order: { createdAt: 'DESC' },
      relations: ['form'],
    });

    const respondentIds = [...new Set(responses.map((r) => r.respondentId))];

    const users = await this.userRepository.find({
      where: { uid: In(respondentIds) },
      select: ['uid', 'email', 'displayName'], // hoặc các field cần hiển thị
    });

    const userMap = new Map(users.map((user) => [user.uid, user]));

    return responses.map((response) => ({
      ...response,
      user: userMap.get(<string>response.respondentId) || null,
    }));
  }
}
