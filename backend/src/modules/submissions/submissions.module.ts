import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from 'src/entities/submission.entity';
import { SubmissionsController } from './controllers/submissions.controller';
import { SubmissionsService } from './services/submissions.service';

@Module({
    imports: [TypeOrmModule.forFeature([Submission])],
    controllers: [SubmissionsController],
    providers: [SubmissionsService],
    exports: [SubmissionsService],
})
export class SubmissionsModule { }