import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DEFAULT_PAGE_SIZE, LeadsService } from './leads.service.js';
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
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = Math.max(parseInt(page ?? '', 10) || 1, 1);
    const l = Math.min(
      Math.max(parseInt(limit ?? '', 10) || DEFAULT_PAGE_SIZE, 1),
      500,
    );
    return this.service.findAll(p, l);
  }
}
