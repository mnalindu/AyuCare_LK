import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AppEnv } from '../config/env';
import { AuthService } from './auth.service';
import { StaffProfileDto } from './dto/login-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<AppEnv, true>, private readonly auth: AuthService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.get('JWT_ACCESS_SECRET', { infer: true }), algorithms: ['HS256'] });
  }
  async validate(payload: { sub?: unknown }): Promise<StaffProfileDto> {
    if (typeof payload.sub !== 'string' || !payload.sub) throw new UnauthorizedException();
    return this.auth.findActiveProfile(payload.sub);
  }
}
