import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { KafkaProducerService } from './services/kafka-producer.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PdfRedactionService } from './services/pdf-redaction.service';
import { AttachmentsService } from './attachments/attachments.service';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly pdfRedactionService: PdfRedactionService,
    private readonly attachmentService: AttachmentsService
  ) {}

  @EventPattern('send_email')
  async handleSendEmail(@Payload() message: any, @Ctx() context: KafkaContext) {
    const originalMessage = context.getMessage();
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = originalMessage.offset;

    try { 

      if (message.data.template) {
        // Send email with template
        await this.mailerService.sendMail({
          to : message.data.to,
          subject: message.data.subject,
          template: message.data.template,
          context: message.data.context
        });
      } else {
        await this.mailerService.sendMail({
          to : message.data.to,
          subject: message.data.subject,
          html: message.data.html
        });
      }

      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);

    } catch (error) {
      await this.kafkaProducer.sendMessage('dead_letter_email', { ...message, error});
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);
    }
  }

  @EventPattern('create_redact_attachment')
  async handleRedactedAttachment(@Payload() message: any, @Ctx() context: KafkaContext) {
    const originalMessage = context.getMessage();
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = originalMessage.offset;

    try { 
      const inputPath = path.resolve('./uploads', `${message.directory_name}${message.stored_filename}`);
      const oututPath = path.resolve('./uploads', `${message.directory_name}redacted_${message.stored_filename}`);
      const file = await this.pdfRedactionService.redactSensitiveInfo(inputPath, oututPath, message);

      await this.attachmentService.create(message.data_item_id, message.data_item_type, file, message.attachment_id)
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);

    } catch (error) {
      await this.kafkaProducer.sendMessage('dead_create_redact_attachment', { ...message, error});
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);
    }
  }
}
