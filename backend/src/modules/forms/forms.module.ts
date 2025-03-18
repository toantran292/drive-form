import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from 'src/entities/form.entity';
import { FormsController } from './controllers/forms.controller';
import { FormsService } from './services/forms.service';

@Module({
    imports: [TypeOrmModule.forFeature([Form])],
    controllers: [FormsController],
    providers: [FormsService],
    exports: [FormsService],
})
export class FormsModule { }