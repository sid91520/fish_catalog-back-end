import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lead } from './lead.model.js';
import { FishProduct } from '../fish-products/fish-product.model.js';
import { LeadsService } from './leads.service.js';
import { LeadsController } from './leads.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Lead, FishProduct])],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
