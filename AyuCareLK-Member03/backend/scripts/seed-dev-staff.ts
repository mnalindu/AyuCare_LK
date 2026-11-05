import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { StaffRole } from '../src/generated/prisma/enums';

async function seed(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') throw new Error('Development seed requires NODE_ENV=development');
  const url = process.env.DATABASE_URL;
  const email = process.env.DEV_SEED_STAFF_EMAIL?.trim().toLowerCase();
  const password = process.env.DEV_SEED_STAFF_PASSWORD;
  const role = process.env.DEV_SEED_STAFF_ROLE ?? StaffRole.DOCTOR;
  if (!url || !email || !password) throw new Error('Database URL and development seed credentials are required');
  if (!/^[^\s@]+@[^\s@]+\.test$/.test(email)) throw new Error('Seed email must use the reserved .test domain');
  if (password.length < 16) throw new Error('Seed password must be at least 16 characters');
  if (!Object.values(StaffRole).includes(role as StaffRole)) throw new Error('Invalid seed role');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      console.log('Synthetic staff account already exists; no record was changed.');
      return;
    }
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 });
    await prisma.user.create({ data: { email, passwordHash, role: role as StaffRole } });
    console.log('Synthetic development staff account created with an Argon2id hash.');
  } finally {
    await prisma.$disconnect();
  }
}

void seed().catch(() => {
  console.error('Development staff seed failed; check configuration and database access.');
  process.exitCode = 1;
});
