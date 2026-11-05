import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config/env';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { STAFF_USER_STORE } from './staff-user.store';
import { UnavailableStaffUserStore } from './unavailable-staff-user.store';

@Module({
  imports: [PassportModule, JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService<AppEnv, true>) => ({ secret: config.get('JWT_ACCESS_SECRET', { infer: true }), signOptions: { algorithm: 'HS256' } }) })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, { provide: STAFF_USER_STORE, useClass: UnavailableStaffUserStore }],
  exports: [AuthService, STAFF_USER_STORE],
})
export class AuthModule {}
