import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SubmissionsService } from '../services/submissions.service';
import { CreateSubmissionDto } from '../dtos/create-submission.dto';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post()
    async create(@Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionsService.create(createSubmissionDto);
    }

    @Get('form/:formId')
    async findByForm(@Param('formId') formId: string) {
        return this.submissionsService.findByForm(formId);
    }
}