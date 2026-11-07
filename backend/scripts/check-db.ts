import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');

async function checkDatabase(): Promise<void> {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const [staffCount, patientCount] = await Promise.all([prisma.user.count(), prisma.patient.count()]);
    console.log(`Database connection OK; staff users: ${staffCount}; patients: ${patientCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

void checkDatabase().catch(() => {
  console.error('Database connection check failed');
  process.exitCode = 1;
});
