import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AdminLoginDto, AdminRegisterDto } from './dto/admin-credentials.dto.js';
import { AdminGuard } from '../common/admin.guard.js';
import { AdminKeyGuard } from '../common/admin-key.guard.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  // Backend-only: requires the server-side x-admin-key, so the frontend never calls this.
  @UseGuards(AdminKeyGuard)
  @Post('register')
  register(@Body() dto: AdminRegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.service.login(dto);
  }

  // Frontend session check: 200 with the admin if the Bearer token is valid, else 401 (show login).
  @UseGuards(AdminGuard)
  @Get('me')
  me(@Req() req: { adminId?: number }) {
    if (req.adminId === undefined) {
      throw new UnauthorizedException('Login required');
    }
    return this.service.me(req.adminId);
  }
}
