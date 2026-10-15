import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Admin } from './admin.model.js';
import { AdminLoginDto, AdminRegisterDto } from './dto/admin-credentials.dto.js';
import { createAdminToken } from './admin-token.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin) private readonly admins: typeof Admin) {}

  async register(dto: AdminRegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.admins.findOne({ where: { email } })) {
      throw new ConflictException('Admin already exists');
    }
    const admin = await this.admins.create({
      email,
      passwordHash: await this.hash(dto.password),
    });
    return { id: admin.id, email: admin.email };
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.admins.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!admin || !(await this.verify(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { token: createAdminToken(admin.id) };
  }

  async me(adminId: number) {
    const admin = await this.admins.findByPk(adminId);
    if (!admin) throw new UnauthorizedException('Admin no longer exists');
    return { id: admin.id, email: admin.email };
  }

  private async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await scryptAsync(password, salt, 64);
    return `${salt.toString('hex')}:${key.toString('hex')}`;
  }

  private async verify(password: string, stored: string): Promise<boolean> {
    const [saltHex, keyHex] = stored.split(':');
    const expected = Buffer.from(keyHex, 'hex');
    const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), 64);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}
