import { Module } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { JobOrdersController } from './job-orders.controller';

@Module({
  controllers: [JobOrdersController],
  providers: [JobOrdersService],
})
export class JobOrdersModule {}
