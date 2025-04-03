import { IsString, IsOptional } from 'class-validator';

export class CreatePhaseDto {
  @IsString()
  phaseCode: string;

  @IsString()
  name: string;

  @IsString()
  projectId: string;
}

export class UpdatePhaseDto {
  @IsOptional()
  @IsString()
  name?: string;
}
