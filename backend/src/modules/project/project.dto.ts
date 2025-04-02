import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  projectCode: string;

  @IsString()
  name: string;

  @IsOptional()
  creator: any;

  @IsString()
  category: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  projectCode?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class AddUserToProjectDto {
  @IsEmail()
  @IsString()
  email: string;
}
