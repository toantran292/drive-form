import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateFormDto {
    @IsString()
    name: string;

    @IsObject()
    @IsOptional()
    metaData?: Record<string, any>;

    @IsString()
    authorId: string;
}