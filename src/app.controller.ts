import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { KafkaProducerService } from './services/kafka-producer.service';
import { MailerService } from '@nestjs-modules/mailer';
import { KafkaDelayService } from './services/kafka-delay.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailerService: MailerService,
    private readonly delayService: KafkaDelayService,
    private readonly kafkaProducer: KafkaProducerService
  ) {}

  @EventPattern('send_email')
  async handleSendEmail(@Payload() message: any, @Ctx() context: KafkaContext) {
    const originalMessage = context.getMessage();
    const consumer = context.getConsumer();
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = originalMessage.offset;

    try { 
      await this.mailerService.sendMail({
        to : message.data.to,
        subject: message.data.subject,
        template: message.data.template,
        context: message.data.context
      });

      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);

    } catch (error) {
      await this.kafkaProducer.sendMessage('dead_letter_email', message);
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(offset) + 1).toString(),
        },
      ]);
    }
  }

  @Get('/send')
  async sendMessage(@Query('msg') msg: string) {
   await this.delayService.sendEmail({
      to: 'trabidao6678@gmail.com',
      subject: 'Hello!',
      template: 'base',
      context: { name: 'John', url: 'https://yourapp.com/verify' }
    }, 60 * 1000);
  }
}
