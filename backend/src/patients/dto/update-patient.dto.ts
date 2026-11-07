import { PartialType } from '@nestjs/swagger';
import { PatientFieldsDto } from './patient-fields.dto';

export class UpdatePatientDto extends PartialType(PatientFieldsDto) {}
