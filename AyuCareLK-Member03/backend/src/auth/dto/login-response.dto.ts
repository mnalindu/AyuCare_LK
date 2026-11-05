import { ApiProperty } from '@nestjs/swagger';
import { StaffRole } from '../roles';

export class StaffProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: StaffRole }) role!: StaffRole;
}

export class LoginResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty({ example: 'Bearer' }) tokenType!: 'Bearer';
  @ApiProperty({ description: 'Access token lifetime in seconds' }) expiresIn!: number;
  @ApiProperty({ type: StaffProfileDto }) user!: StaffProfileDto;
}
