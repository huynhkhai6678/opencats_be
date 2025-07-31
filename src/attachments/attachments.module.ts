import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { AuthModule } from '../auth/auth.module';
import { KafkaProducerService } from '../services/kafka-producer.service';

@Module({
  imports: [AuthModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, KafkaProducerService],
  exports: [AttachmentsService]
})
export class AttachmentsModule {}
