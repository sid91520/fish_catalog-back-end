import { Controller, Get, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service.js';
import { AdminGuard } from '../common/admin.guard.js';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  // Admin only: hands out a short-lived signature for a direct Cloudinary upload.
  @UseGuards(AdminGuard)
  @Get('signature')
  signature() {
    return this.service.createSignature();
  }
}
