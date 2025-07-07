import { PartialType } from '@nestjs/mapped-types';
import { CreateJobOrderDto } from './create-job-order.dto';

export class UpdateJobOrderDto extends PartialType(CreateJobOrderDto) {}
