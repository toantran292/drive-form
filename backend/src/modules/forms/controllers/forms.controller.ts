import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { FormsService } from '../services/forms.service';
import { CreateFormDto } from '../dtos/create-form.dto';

@Controller('forms')
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    @Post()
    async create(@Body() createFormDto: CreateFormDto) {
        return this.formsService.create(createFormDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.formsService.findOne(id);
    }
}