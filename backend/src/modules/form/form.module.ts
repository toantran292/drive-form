import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { Form, FormResponse } from '../../entities/form.entity';
import { AuthModule } from '../auth/auth.module';
import { Phase } from '../../entities/phase.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Form, FormResponse, Phase]), AuthModule],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService],
})
export class FormModule {}
