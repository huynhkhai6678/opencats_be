import { PartialType } from '@nestjs/mapped-types';
import { CreateHeadhuntDto } from './create-headhunt.dto';

export class UpdateHeadhuntDto extends PartialType(CreateHeadhuntDto) {}
