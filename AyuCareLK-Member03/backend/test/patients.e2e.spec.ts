import 'reflect-metadata';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { StaffRole } from '../src/auth/roles';
import { STAFF_USER_STORE, StaffUserRecord } from '../src/auth/staff-user.store';
import { HttpErrorFilter } from '../src/common/http-exception.filter';
import { PatientsService } from '../src/patients/patients.service';

const staffId = '22222222-2222-4222-8222-222222222222';
const patientId = '11111111-1111-4111-8111-111111111111';
const responsePatient = {
  id: patientId,
  patientNumber: 23,
  fullName: 'Nimali Perera',
  dateOfBirth: '1990-04-15',
  phone: '+94771234567',
  email: null,
  address: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('patient HTTP API', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let staff: StaffUserRecord;
  let patients: { create: jest.Mock; findAll: jest.Mock; findOne: jest.Mock; update: jest.Mock };

  beforeAll(async () => {
    staff = { id: staffId, email: 'receptionist@ayucare.test', passwordHash: 'not-returned', role: StaffRole.RECEPTIONIST, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    patients = {
      create: jest.fn().mockResolvedValue(responsePatient),
      findAll: jest.fn().mockResolvedValue({ items: [responsePatient], page: 1, limit: 20, total: 1, totalPages: 1 }),
      findOne: jest.fn().mockResolvedValue(responsePatient),
      update: jest.fn().mockResolvedValue(responsePatient),
    };
    const users = { findById: jest.fn(async (id: string) => id === staffId ? staff : null), findByEmail: jest.fn() };
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(STAFF_USER_STORE).useValue(users)
      .overrideProvider(PatientsService).useValue(patients)
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, forbidUnknownValues: true }));
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
    jwt = app.get(JwtService);
  });
  beforeEach(() => { staff.role = StaffRole.RECEPTIONIST; jest.clearAllMocks(); });
  afterAll(async () => { await app?.close(); });

  async function authorization(): Promise<string> {
    return `Bearer ${await jwt.signAsync({ sub: staffId, role: staff.role })}`;
  }

  it('requires a valid JWT for every patient route', async () => {
    await request(app.getHttpServer()).post('/api/v1/patients').send({ fullName: 'Nimali Perera' }).expect(401);
    await request(app.getHttpServer()).get('/api/v1/patients').expect(401);
    await request(app.getHttpServer()).get(`/api/v1/patients/${patientId}`).expect(401);
    await request(app.getHttpServer()).patch(`/api/v1/patients/${patientId}`).send({ fullName: 'Nimali Silva' }).expect(401);
    await request(app.getHttpServer()).get('/api/v1/patients').set('Authorization', 'Bearer invalid').expect(401);
  });

  it('allows reception to register and normalizes contact input', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/patients').set('Authorization', await authorization())
      .send({ fullName: '  Nimali   Perera ', dateOfBirth: '1990-04-15', phone: '+94 77 123 4567' }).expect(201);
    expect(patients.create).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Nimali Perera', phone: '+94771234567' }), staffId);
    expect(response.body).toEqual(responsePatient);
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it.each([
    { label: 'missing name', body: {} },
    { label: 'blank name', body: { fullName: '   ' } },
    { label: 'future birth date', body: { fullName: 'Nimali Perera', dateOfBirth: '2999-01-01' } },
    { label: 'invalid birth date', body: { fullName: 'Nimali Perera', dateOfBirth: '2026-02-30' } },
    { label: 'invalid phone', body: { fullName: 'Nimali Perera', phone: 'abc' } },
    { label: 'client supplied patient number', body: { fullName: 'Nimali Perera', patientNumber: 999 } },
  ])('rejects $label', async ({ body }) => {
    await request(app.getHttpServer()).post('/api/v1/patients').set('Authorization', await authorization()).send(body).expect(400);
    expect(patients.create).not.toHaveBeenCalled();
  });

  it('applies role restrictions to reads and writes', async () => {
    staff.role = StaffRole.DOCTOR;
    await request(app.getHttpServer()).get('/api/v1/patients').set('Authorization', await authorization()).expect(200);
    await request(app.getHttpServer()).post('/api/v1/patients').set('Authorization', await authorization()).send({ fullName: 'Nimali Perera' }).expect(403);
    await request(app.getHttpServer()).patch(`/api/v1/patients/${patientId}`).set('Authorization', await authorization()).send({ fullName: 'Nimali Silva' }).expect(403);
    staff.role = StaffRole.CASHIER;
    await request(app.getHttpServer()).get('/api/v1/patients').set('Authorization', await authorization()).expect(403);
  });

  it('validates pagination and forwards a search request', async () => {
    await request(app.getHttpServer()).get('/api/v1/patients?page=0').set('Authorization', await authorization()).expect(400);
    await request(app.getHttpServer()).get('/api/v1/patients?limit=101').set('Authorization', await authorization()).expect(400);
    await request(app.getHttpServer()).get('/api/v1/patients?page=2&limit=10&search=Nimali').set('Authorization', await authorization()).expect(200);
    expect(patients.findAll).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 10, search: 'Nimali' }));
  });

  it('retrieves by UUID and returns 404 for missing patients', async () => {
    await request(app.getHttpServer()).get('/api/v1/patients/not-a-uuid').set('Authorization', await authorization()).expect(400);
    await request(app.getHttpServer()).get(`/api/v1/patients/${patientId}`).set('Authorization', await authorization()).expect(200);
    patients.findOne.mockRejectedValueOnce(new NotFoundException('Patient not found'));
    await request(app.getHttpServer()).get(`/api/v1/patients/${patientId}`).set('Authorization', await authorization()).expect(404);
  });

  it('permits demographic updates while rejecting protected fields', async () => {
    await request(app.getHttpServer()).patch(`/api/v1/patients/${patientId}`).set('Authorization', await authorization()).send({ fullName: 'Nimali Silva' }).expect(200);
    expect(patients.update).toHaveBeenCalledWith(patientId, expect.objectContaining({ fullName: 'Nimali Silva' }));
    await request(app.getHttpServer()).patch(`/api/v1/patients/${patientId}`).set('Authorization', await authorization()).send({ patientNumber: 99 }).expect(400);
    await request(app.getHttpServer()).patch(`/api/v1/patients/${patientId}`).set('Authorization', await authorization()).send({ registeredById: staffId }).expect(400);
  });
});
