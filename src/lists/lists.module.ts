import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { AuthModule } from '../auth/auth.module';
import { KafkaDelayService } from '../services/kafka-delay.service';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [ListsController],
  providers: [ListsService, KafkaDelayService],
})
export class ListsModule {}
