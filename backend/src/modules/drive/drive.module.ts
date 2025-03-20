import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveController } from './drive.controller';
import { DriveService } from './drive.service';
import { DriveItem } from '../../entities/drive-item.entity';
import { Form } from '../../entities/form.entity';
import { AuthModule } from '../auth/auth.module';
import { FormModule } from '../form/form.module';
import { User } from '../../entities/user.entity';
import { FormResponse } from '../../entities/form.entity';
import { SharedModule } from '../../shared/shared.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DriveItem, Form, User, FormResponse]),
        AuthModule,
        FormModule,
        SharedModule
    ],
    controllers: [DriveController],
    providers: [DriveService],
    exports: [DriveService],
})
export class DriveModule { } 