import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FishProductsService } from './fish-products.service.js';
import { CreateFishProductDto } from './dto/create-fish-product.dto.js';
import { UpdateFishProductDto } from './dto/update-fish-product.dto.js';
import { AdminGuard } from '../common/admin.guard.js';

@Controller('fish-products')
export class FishProductsController {
  constructor(private readonly service: FishProductsService) {}

  // Public
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Admin only
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateFishProductDto) {
    return this.service.create(dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFishProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
