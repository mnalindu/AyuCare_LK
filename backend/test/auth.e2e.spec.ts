import 'reflect-metadata';
import { Controller, Get, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Roles } from '../src/auth/roles.decorator';
import { StaffRole } from '../src/auth/roles';
import { STAFF_USER_STORE, StaffUserRecord, StaffUserStore } from '../src/auth/staff-user.store';
import { HttpErrorFilter } from '../src/common/http-exception.filter';

@Controller('test/doctor')
@ApiBearerAuth()
class DoctorTestController {
  @Get()
  @Roles(StaffRole.DOCTOR)
  get(): { allowed: boolean } { return { allowed: true }; }
}

describe('authentication API', () => {
  let app: INestApplication;
  let user: StaffUserRecord;
  let store: StaffUserStore;
  beforeAll(async () => {
    user = { id: 'staff-1', email: 'doctor@example.com', passwordHash: await argon2.hash('correct-password', { type: argon2.argon2id }), role: StaffRole.DOCTOR, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    store = { findByEmail: jest.fn(async (email) => email === user.email ? user : null), findById: jest.fn(async (id) => id === user.id ? user : null) };
    const module = await Test.createTestingModule({ imports: [AppModule], controllers: [DoctorTestController] }).overrideProvider(STAFF_USER_STORE).useValue(store).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, forbidUnknownValues: true }));
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  const login = () => request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'doctor@example.com', password: 'correct-password' });

  it('logs in, omits hash, and returns a valid profile for /me', async () => {
    const response = await login().expect(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toEqual({ id: user.id, email: user.email, role: StaffRole.DOCTOR });
    expect(JSON.stringify(response.body)).not.toContain(user.passwordHash);
    const me = await request(app.getHttpServer()).get('/api/v1/auth/me').set('Authorization', `Bearer ${response.body.accessToken}`).expect(200);
    expect(me.body).toEqual(response.body.user);
    expect(JSON.stringify(me.body)).not.toContain(user.passwordHash);
  });

  it.each([
    ['wrong password', { email: 'doctor@example.com', password: 'wrong' }],
    ['unknown user', { email: 'missing@example.com', password: 'correct-password' }],
  ])('returns a generic error for %s', async (_label, body) => {
    const response = await request(app.getHttpServer()).post('/api/v1/auth/login').send(body).expect(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('rejects an inactive user', async () => {
    user.isActive = false;
    await login().expect(401);
    user.isActive = true;
  });

  it.each([{}, { email: 'not-an-email', password: 'x' }, { email: 'doctor@example.com' }])('rejects malformed login body', async (body) => {
    await request(app.getHttpServer()).post('/api/v1/auth/login').send(body).expect(400);
  });

  it('rejects missing, malformed, expired, and incorrectly signed JWTs', async () => {
    const jwt = app.get(JwtService);
    const expired = await jwt.signAsync({ sub: user.id, role: user.role }, { expiresIn: -1 });
    const wrongSignature = await jwt.signAsync({ sub: user.id, role: user.role }, { secret: 'different-secret-with-more-than-32-characters' });
    for (const token of [undefined, 'Bearer garbage', `Bearer ${expired}`, `Bearer ${wrongSignature}`]) {
      const call = request(app.getHttpServer()).get('/api/v1/auth/me');
      await (token ? call.set('Authorization', token) : call).expect(401);
    }
  });

  it('enforces role restrictions', async () => {
    const response = await login().expect(200);
    const authorization = `Bearer ${response.body.accessToken}`;
    await request(app.getHttpServer()).get('/api/v1/test/doctor').set('Authorization', authorization).expect(200);
    user.role = StaffRole.CASHIER;
    await request(app.getHttpServer()).get('/api/v1/test/doctor').set('Authorization', authorization).expect(403);
    user.role = StaffRole.DOCTOR;
  });

  it('returns 204 for logout but leaves the stateless token valid until expiry', async () => {
    const response = await login().expect(200);
    const authorization = `Bearer ${response.body.accessToken}`;
    await request(app.getHttpServer()).post('/api/v1/auth/logout').set('Authorization', authorization).expect(204);
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Authorization', authorization).expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/logout').expect(401);
  });
});
