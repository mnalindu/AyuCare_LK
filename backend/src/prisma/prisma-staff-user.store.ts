import { Injectable } from '@nestjs/common';
import { StaffRole } from '../auth/roles';
import { StaffUserRecord, StaffUserStore } from '../auth/staff-user.store';
import type { User } from '../generated/prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaStaffUserStore implements StaffUserStore {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<StaffUserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toRecord(user) : null;
  }

  async findById(id: string): Promise<StaffUserRecord | null> {
    // Reject malformed JWT subjects before asking PostgreSQL to parse a UUID.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toRecord(user) : null;
  }

  private toRecord(user: User): StaffUserRecord {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as StaffRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
