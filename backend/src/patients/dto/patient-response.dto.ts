import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 1 }) patientNumber!: number;
  @ApiProperty({ example: 'Nimali Perera' }) fullName!: string;
  @ApiPropertyOptional({ example: '1990-04-15', nullable: true }) dateOfBirth!: string | null;
  @ApiPropertyOptional({ example: '+94771234567', nullable: true }) phone!: string | null;
  @ApiPropertyOptional({ example: 'nimali@example.test', nullable: true }) email!: string | null;
  @ApiPropertyOptional({ example: 'Colombo, Sri Lanka', nullable: true }) address!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: string;
}

export class PatientListResponseDto {
  @ApiProperty({ type: [PatientResponseDto] }) items!: PatientResponseDto[];
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 1 }) total!: number;
  @ApiProperty({ example: 1 }) totalPages!: number;
}
