import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { AppEnv } from '../config/env';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, StaffProfileDto } from './dto/login-response.dto';
import { STAFF_USER_STORE, StaffUserRecord, StaffUserStore } from './staff-user.store';

@Injectable()
export class AuthService {
  constructor(
    @Inject(STAFF_USER_STORE) private readonly users: StaffUserStore,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  profile(user: StaffUserRecord): StaffProfileDto {
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(input: LoginDto): Promise<LoginResponseDto> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());
    // Verify against a dummy hash for unknown users to limit account enumeration by timing.
    const hash = user?.passwordHash ?? '$argon2id$v=19$m=65536,t=3,p=4$zZqnSZ0c/Hpu2B5CQRnQDA$CneyCYJu0L0gsTye3Z4WHeZkGEiv2w20J6nnrH57g60';
    let passwordMatches = false;
    try { passwordMatches = await argon2.verify(hash, input.password); } catch { /* malformed stored hash */ }
    if (!user || !user.isActive || !passwordMatches) throw new UnauthorizedException('Invalid credentials');
    const expiresIn = this.config.get('JWT_ACCESS_TTL_SECONDS', { infer: true });
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role }, { expiresIn });
    return { accessToken, tokenType: 'Bearer', expiresIn, user: this.profile(user) };
  }

  async findActiveProfile(id: string): Promise<StaffProfileDto> {
    const user = await this.users.findById(id);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return this.profile(user);
  }
}
