import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Category, Project } from '../../entities/project.entity';
import { ProjectAdminController } from './project.admin.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Category, User]), AuthModule],
  controllers: [ProjectController, ProjectAdminController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
