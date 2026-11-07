import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../src/prisma/prisma.service';
import { PatientsService } from '../src/patients/patients.service';

const id = '11111111-1111-4111-8111-111111111111';
const staffId = '22222222-2222-4222-8222-222222222222';
const patient = {
  id,
  patientNumber: 23,
  fullName: 'Nimali Perera',
  dateOfBirth: new Date('1990-04-15T00:00:00.000Z'),
  phone: '+94771234567',
  email: 'nimali@example.test',
  address: 'Colombo',
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('PatientsService', () => {
  let service: PatientsService;
  let db: {
    patient: {
      findFirst: jest.Mock;
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    db = {
      patient: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(patient),
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([patient]),
        findUnique: jest.fn().mockResolvedValue(patient),
        update: jest.fn().mockResolvedValue(patient),
      },
      $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    };
    service = new PatientsService(db as unknown as PrismaService);
  });

  it('registers a patient with server-controlled identifiers and registrar', async () => {
    const created = await service.create({ fullName: 'Nimali Perera', dateOfBirth: '1990-04-15', phone: '+94771234567' }, staffId);
    expect(db.patient.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ fullName: 'Nimali Perera', registeredById: staffId, dateOfBirth: patient.dateOfBirth }), select: expect.any(Object) }));
    expect(created).toEqual(expect.objectContaining({ id, patientNumber: 23, dateOfBirth: '1990-04-15' }));
    expect(created).not.toHaveProperty('registeredById');
    expect(created).not.toHaveProperty('passwordHash');
  });

  it('rejects a likely duplicate with matching name, birth date, and contact', async () => {
    db.patient.findFirst.mockResolvedValue({ id });
    await expect(service.create({ fullName: 'Nimali Perera', dateOfBirth: '1990-04-15', phone: '+94771234567' }, staffId)).rejects.toBeInstanceOf(ConflictException);
    expect(db.patient.create).not.toHaveBeenCalled();
  });

  it('does not treat a shared phone alone as a duplicate', async () => {
    await service.create({ fullName: 'Another Patient', phone: '+94771234567' }, staffId);
    expect(db.patient.findFirst).not.toHaveBeenCalled();
    expect(db.patient.create).toHaveBeenCalled();
  });

  it('maps a database uniqueness conflict to 409', async () => {
    db.patient.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create({ fullName: 'Nimali Perera' }, staffId)).rejects.toBeInstanceOf(ConflictException);
  });

  it('paginates and searches by name', async () => {
    const result = await service.findAll({ page: 2, limit: 10, search: 'Nimali' });
    expect(db.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10, where: { OR: [{ fullName: { contains: 'Nimali', mode: 'insensitive' } }] } }));
    expect(result).toEqual(expect.objectContaining({ page: 2, limit: 10, total: 1, totalPages: 1 }));
    expect(result.items[0]).not.toHaveProperty('passwordHash');
  });

  it('uses page 1 and limit 20 when the query is empty', async () => {
    const result = await service.findAll({} as never);
    expect(db.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 20 }));
    expect(result).toEqual(expect.objectContaining({ page: 1, limit: 20 }));
  });

  it('searches by patient number and UUID', async () => {
    await service.findAll({ page: 1, limit: 20, search: '23' });
    expect(db.patient.findMany.mock.calls[0][0].where.OR).toContainEqual({ patientNumber: 23 });
    await service.findAll({ page: 1, limit: 20, search: id });
    expect(db.patient.findMany.mock.calls[1][0].where.OR).toContainEqual({ id });
  });

  it('rejects an unsafe pagination offset', async () => {
    await expect(service.findAll({ page: Number.MAX_SAFE_INTEGER, limit: 100 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a patient by UUID and maps missing records to 404', async () => {
    expect(await service.findOne(id)).toEqual(expect.objectContaining({ id, fullName: patient.fullName }));
    db.patient.findUnique.mockResolvedValue(null);
    await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates only permitted demographic fields', async () => {
    await service.update(id, { fullName: 'Nimali Silva', phone: null });
    expect(db.patient.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id }, data: { fullName: 'Nimali Silva', phone: null } }));
  });

  it('rejects empty updates, null names, and missing patients', async () => {
    await expect(service.update(id, {})).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.update(id, { fullName: null } as never)).rejects.toBeInstanceOf(BadRequestException);
    db.patient.update.mockRejectedValue({ code: 'P2025' });
    await expect(service.update(id, { fullName: 'Nimali Silva' })).rejects.toBeInstanceOf(NotFoundException);
  });
});
