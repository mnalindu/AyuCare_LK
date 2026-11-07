import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { StaffUserRecord, StaffUserStore } from './staff-user.store';

/** Member 04 replaces this adapter with a Prisma-backed implementation. */
@Injectable()
export class UnavailableStaffUserStore implements StaffUserStore {
  findByEmail(_email: string): Promise<StaffUserRecord | null> {
    void _email;
    throw new ServiceUnavailableException('Staff database integration is unavailable');
  }

  findById(_id: string): Promise<StaffUserRecord | null> {
    void _id;
    throw new ServiceUnavailableException('Staff database integration is unavailable');
  }
}
