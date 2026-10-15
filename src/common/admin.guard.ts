import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyAdminToken } from '../admin/admin-token.js';

/**
 * Admin protection: accepts either the x-admin-key header (ADMIN_API_KEY)
 * or an `Authorization: Bearer <token>` issued by POST /admin/login.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const expected = process.env.ADMIN_API_KEY;
    if (expected && req.headers['x-admin-key'] === expected) return true;

    const bearer = /^Bearer\s+(.+?)\s*$/i.exec(req.headers['authorization'] ?? '');
    const adminId = bearer ? verifyAdminToken(bearer[1]) : null;
    if (adminId !== null) {
      req.adminId = adminId;
      return true;
    }

    throw new UnauthorizedException('Invalid admin credentials');
  }
}
