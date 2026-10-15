import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { AdminGuard } from '../common/admin.guard.js';

@Controller('leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  // Public: users submit a lead
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.service.create(dto);
  }

  // Admin only: view submitted leads
  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
