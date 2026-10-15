import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from './admin.model.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Admin])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
