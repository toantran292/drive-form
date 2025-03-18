import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from 'src/entities/submission.entity';
import { CreateSubmissionDto } from '../dtos/create-submission.dto';

@Injectable()
export class SubmissionsService {
    constructor(
        @InjectRepository(Submission)
        private submissionsRepository: Repository<Submission>,
    ) { }

    async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
        const submission = this.submissionsRepository.create(createSubmissionDto);
        return this.submissionsRepository.save(submission);
    }

    async findByForm(formId: string): Promise<Submission[]> {
        return this.submissionsRepository.find({ where: { formId } });
    }
}