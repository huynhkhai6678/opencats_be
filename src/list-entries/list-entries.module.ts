import { Module } from '@nestjs/common';
import { ListEntriesService } from './list-entries.service';
import { ListEntriesController } from './list-entries.controller';

@Module({
  controllers: [ListEntriesController],
  providers: [ListEntriesService],
})
export class ListEntriesModule {}
