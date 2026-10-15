import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/** Strict guard: only the server-side x-admin-key header (ADMIN_API_KEY) is accepted. */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const expected = process.env.ADMIN_API_KEY;
    if (!expected || req.headers['x-admin-key'] !== expected) {
      throw new UnauthorizedException('Invalid admin key');
    }
    return true;
  }
}
