import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateSubmissionDto {
    @IsObject()
    metaData: Record<string, any>;

    @IsString()
    formId: string;

    @IsString()
    @IsOptional()
    userId?: string;
}