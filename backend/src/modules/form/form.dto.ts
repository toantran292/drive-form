import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../../entities/form.entity';

export class QuestionDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  required: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsOptional()
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedFileTypes?: string[];
  };

  @IsOptional()
  layout?: {
    columns?: number;
    rows?: string[];
  };

  @IsOptional()
  scale?: {
    start: number;
    end: number;
    startLabel?: string;
    endLabel?: string;
  };
}

export class CreateFormDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];
}

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];
}
