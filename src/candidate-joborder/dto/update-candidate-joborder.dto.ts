import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateJoborderDto } from './create-candidate-joborder.dto';

export class UpdateCandidateJoborderDto extends PartialType(CreateCandidateJoborderDto) {}
