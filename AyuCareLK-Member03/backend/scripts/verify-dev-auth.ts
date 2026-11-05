import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

let verificationStage = 'configuration';

async function verify(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') throw new Error('Verification requires NODE_ENV=development');
  const email = process.env.DEV_SEED_STAFF_EMAIL?.trim().toLowerCase();
  const password = process.env.DEV_SEED_STAFF_PASSWORD;
  if (!email || !password) throw new Error('Development seed credentials are required');

  verificationStage = 'application creation';
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  app.setGlobalPrefix('api/v1');
  try {
    verificationStage = 'application initialization';
    await app.init();
    verificationStage = 'stored hash check';
    const stored = await app.get(PrismaService).user.findUnique({ where: { email }, select: { passwordHash: true } });
    if (!stored?.passwordHash.startsWith('$argon2id$') || stored.passwordHash === password) throw new Error('Unsafe stored password');
    const server = app.getHttpServer();
    verificationStage = 'login';
    const login = await request(server).post('/api/v1/auth/login').send({ email, password });
    if (login.status !== 200 || typeof login.body.accessToken !== 'string') throw new Error('Login failed');
    if (JSON.stringify(login.body).includes('passwordHash')) throw new Error('Unsafe login response');
    verificationStage = 'current-user lookup';
    const me = await request(server).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`);
    if (me.status !== 200 || me.body.email !== email || JSON.stringify(me.body).includes('passwordHash')) throw new Error('Profile check failed');
    verificationStage = 'protected patient list';
    const list = await request(server).get('/api/v1/patients').set('Authorization', `Bearer ${login.body.accessToken}`);
    if (list.status !== 200 || !Array.isArray(list.body.items) || list.body.page !== 1 || list.body.limit !== 20) throw new Error(`Patient list check failed: status=${list.status}, detail=${JSON.stringify(list.body.message)}`);
    console.log('Database-backed login, /auth/me, and protected patient list verified.');
  } finally {
    await app.close();
  }
}

void verify().catch((error: unknown) => {
  const kind = error instanceof Error ? error.name : 'UnknownError';
  let detail = error instanceof Error ? error.message : '';
  for (const sensitive of [process.env.DATABASE_URL, process.env.JWT_ACCESS_SECRET, process.env.DEV_SEED_STAFF_PASSWORD]) {
    if (sensitive) detail = detail.replaceAll(sensitive, '[redacted]');
  }
  console.error(`Development authentication verification failed at ${verificationStage} (${kind}): ${detail}`);
  process.exitCode = 1;
});
