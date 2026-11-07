import { Transform } from 'class-transformer';
import { IsEmail, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function todayInColombo(): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

@ValidatorConstraint({ name: 'notFutureDateOfBirth', async: false })
export class NotFutureDateOfBirth implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && value <= todayInColombo();
  }
  defaultMessage(): string { return 'dateOfBirth must not be in the future'; }
}

export class PatientFieldsDto {
  @ApiProperty({ example: 'Nimali Perera', maxLength: 200 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName!: string;

  @ApiPropertyOptional({ example: '1990-04-15', format: 'date', nullable: true })
  @IsOptional()
  @IsString()
  @IsISO8601({ strict: true })
  @Validate(NotFutureDateOfBirth)
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ example: '+94771234567', maxLength: 32, nullable: true })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.replace(/[\s()-]/g, '') : value)
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must contain 7 to 15 digits with an optional leading +' })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'nimali@example.test', maxLength: 254, nullable: true })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @ApiPropertyOptional({ example: 'Colombo, Sri Lanka', maxLength: 1000, nullable: true })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  address?: string | null;
}
