import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { PatientsService } from '../src/patients/patients.service';
import type { PrismaService } from '../src/prisma/prisma.service';

const rollbackMarker = new Error('rollback synthetic patient');

async function verify(): Promise<void> {
  const url = process.env.DATABASE_URL;
  const staffEmail = process.env.DEV_SEED_STAFF_EMAIL?.trim().toLowerCase();
  if (!url || !staffEmail || process.env.NODE_ENV !== 'development') throw new Error('Development database and synthetic staff are required');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const staff = await prisma.user.findUnique({ where: { email: staffEmail }, select: { id: true } });
    if (!staff) throw new Error('Synthetic staff account is missing');
    const before = await prisma.patient.count();
    const suffix = randomUUID().slice(0, 8);
    try {
      await prisma.$transaction(async (tx) => {
        // Keep every synthetic write inside this transaction; the marker below rolls it back.
        const transactionalDb = {
          patient: tx.patient,
          $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
        } as unknown as PrismaService;
        const patients = new PatientsService(transactionalDb);
        const input = { fullName: `Synthetic Patient ${suffix}`, dateOfBirth: '1990-04-15', email: `patient-${suffix}@example.test` };
        const created = await patients.create(input, staff.id);
        if (!created.id || created.patientNumber < 1) throw new Error('Registration failed');
        const list = await patients.findAll({ page: 1, limit: 10, search: input.fullName });
        if (!list.items.some((item) => item.id === created.id)) throw new Error('Search failed');
        if ((await patients.findOne(created.id)).id !== created.id) throw new Error('Retrieval failed');
        const updated = await patients.update(created.id, { address: 'Synthetic address' });
        if (updated.address !== 'Synthetic address') throw new Error('Update failed');
        let duplicateRejected = false;
        try { await patients.create(input, staff.id); } catch (error) { duplicateRejected = error instanceof Error && error.name === 'ConflictException'; }
        if (!duplicateRejected) throw new Error('Duplicate check failed');
        throw rollbackMarker;
      });
    } catch (error) {
      if (error !== rollbackMarker) throw error;
    }
    if (await prisma.patient.count() !== before) throw new Error('Synthetic patient was not rolled back');
    console.log('Patient create, search, retrieval, update, and duplicate handling verified; synthetic row rolled back.');
  } finally {
    await prisma.$disconnect();
  }
}

void verify().catch(() => {
  console.error('Patient database integration verification failed.');
  process.exitCode = 1;
});
