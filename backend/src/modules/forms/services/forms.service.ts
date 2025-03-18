import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from 'src/entities/form.entity';
import { CreateFormDto } from '../dtos/create-form.dto';

@Injectable()
export class FormsService {
    constructor(
        @InjectRepository(Form)
        private formsRepository: Repository<Form>,
    ) { }

    async create(createFormDto: CreateFormDto): Promise<Form> {
        const form = this.formsRepository.create(createFormDto);
        return this.formsRepository.save(form);
    }

    async findOne(id: string): Promise<Form> {
        return this.formsRepository.findOneOrFail({ where: { id } });
    }
}