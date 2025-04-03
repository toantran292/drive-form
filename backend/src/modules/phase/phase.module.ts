// phase.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhaseController } from './phase.controller';
import { PhaseService } from './phase.service';
import { Phase } from '../../entities/phase.entity';
import { Form, FormResponse } from '../../entities/form.entity';
import { User } from '../../entities/user.entity';
import { FormService } from '../form/form.service';
import { AuthService } from '../auth/auth.service';
import { SharedModule } from '../../shared/shared.module';
import { DriveModule } from '../drive/drive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Phase, FormResponse, Form, User]),
    SharedModule,
    DriveModule,
  ],
  controllers: [PhaseController],
  providers: [
    PhaseService,
    FormService,
    AuthService,
    SharedModule,
    DriveModule,
  ],
  exports: [PhaseService, FormService, AuthService, SharedModule, DriveModule],
})
export class PhaseModule {}
