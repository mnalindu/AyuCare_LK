import { StaffRole as PrismaStaffRole } from '../src/generated/prisma/enums';
import { StaffRole as AuthStaffRole } from '../src/auth/roles';

describe('staff role contract', () => {
  it('keeps Prisma and auth role values aligned', () => {
    expect(Object.values(PrismaStaffRole).sort()).toEqual(Object.values(AuthStaffRole).sort());
  });
});
