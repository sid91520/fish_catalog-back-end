import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FishProduct } from './fish-product.model.js';
import { FishProductsService } from './fish-products.service.js';
import { FishProductsController } from './fish-products.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([FishProduct])],
  controllers: [FishProductsController],
  providers: [FishProductsService],
  exports: [FishProductsService],
})
export class FishProductsModule {}
