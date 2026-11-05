import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Patient, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ListPatientsQueryDto } from './dto/list-patients-query.dto';
import { PatientListResponseDto, PatientResponseDto } from './dto/patient-response.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

const patientSelect = {
  id: true,
  patientNumber: true,
  fullName: true,
  dateOfBirth: true,
  phone: true,
  email: true,
  address: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

type SelectedPatient = Pick<Patient, keyof typeof patientSelect>;

function isPrismaCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function toResponse(patient: SelectedPatient): PatientResponseDto {
  return {
    id: patient.id,
    patientNumber: patient.patientNumber,
    fullName: patient.fullName,
    dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    isActive: patient.isActive,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  };
}

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreatePatientDto, registeredById: string): Promise<PatientResponseDto> {
    // A shared phone/email alone is never a duplicate. Require matching name and DOB too.
    const contacts: Prisma.PatientWhereInput[] = [];
    if (input.phone) contacts.push({ phone: input.phone });
    if (input.email) contacts.push({ email: input.email });
    if (input.dateOfBirth && contacts.length) {
      const existing = await this.prisma.patient.findFirst({
        where: {
          fullName: { equals: input.fullName, mode: 'insensitive' },
          dateOfBirth: new Date(`${input.dateOfBirth}T00:00:00.000Z`),
          OR: contacts,
        },
        select: { id: true },
      });
      if (existing) throw new ConflictException('A matching patient record already exists');
    }

    try {
      const patient = await this.prisma.patient.create({
        data: {
          fullName: input.fullName,
          dateOfBirth: input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00.000Z`) : null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          address: input.address ?? null,
          registeredById,
        },
        select: patientSelect,
      });
      return toResponse(patient);
    } catch (error) {
      if (isPrismaCode(error, 'P2002')) throw new ConflictException('Patient identifier conflict');
      throw error;
    }
  }

  async findAll(query: ListPatientsQueryDto): Promise<PatientListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const terms: Prisma.PatientWhereInput[] = [];
    if (search) {
      terms.push({ fullName: { contains: search, mode: 'insensitive' } });
      if (/^\d+$/.test(search) && Number.isSafeInteger(Number(search))) terms.push({ patientNumber: Number(search) });
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search)) terms.push({ id: search });
    }
    const where: Prisma.PatientWhereInput = terms.length ? { OR: terms } : {};
    const skip = (page - 1) * limit;
    if (!Number.isSafeInteger(skip)) throw new BadRequestException('Pagination offset is too large');
    const [total, patients] = await this.prisma.$transaction([
      this.prisma.patient.count({ where }),
      this.prisma.patient.findMany({ where, select: patientSelect, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    ]);
    return { items: patients.map(toResponse), page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findUnique({ where: { id }, select: patientSelect });
    if (!patient) throw new NotFoundException('Patient not found');
    return toResponse(patient);
  }

  async update(id: string, input: UpdatePatientDto): Promise<PatientResponseDto> {
    if (!Object.keys(input).length) throw new BadRequestException('Provide at least one permitted field');
    if (input.fullName === null) throw new BadRequestException('fullName cannot be null');
    const data: Prisma.PatientUpdateInput = {};
    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00.000Z`) : null;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.email !== undefined) data.email = input.email;
    if (input.address !== undefined) data.address = input.address;
    try {
      const patient = await this.prisma.patient.update({ where: { id }, data, select: patientSelect });
      return toResponse(patient);
    } catch (error) {
      if (isPrismaCode(error, 'P2025')) throw new NotFoundException('Patient not found');
      if (isPrismaCode(error, 'P2002')) throw new ConflictException('Patient update conflicts with an existing record');
      throw error;
    }
  }
}
