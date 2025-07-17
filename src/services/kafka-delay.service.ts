import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaDelayService implements OnModuleInit {
  private readonly redis = new Redis();
  private readonly kafka = new Kafka({
    clientId: 'delay-worker',
    brokers: ['localhost:9092'],
  });
  private readonly producer = this.kafka.producer();
  private readonly logger = new Logger(KafkaDelayService.name);

  private readonly DELAY_QUEUE = 'delayed_emails';
  private readonly MAIN_TOPIC = 'send_email';

  async onModuleInit() {
    await this.producer.connect();
  }

  async sendEmail(payload: any, delayInMs?: number) {
    const envelope = {
      pattern: 'send_email',
      data: payload,
    };

    const msg = JSON.stringify(envelope);

    if (delayInMs && delayInMs > 0) {
        const timestamp = Date.now() + delayInMs;
        await this.redis.zadd(this.DELAY_QUEUE, timestamp, msg);
        this.logger.log(`Email scheduled with ${delayInMs}ms delay`);
    } else {
        await this.producer.send({
            topic: this.MAIN_TOPIC,
            messages: [{ value: msg }],
        });
        this.logger.log(`Email sent immediately`);
    }
  }

  // ⏱ Poll Redis every 5 seconds using @Interval
  @Interval(5000)
  async checkAndDispatchDueMessages() {
    const now = Date.now();
    const messages = await this.redis.zrangebyscore(this.DELAY_QUEUE, 0, now);

    for (const raw of messages) {
      try {
        await this.producer.send({
          topic: this.MAIN_TOPIC,
          messages: [{ value: raw }],
        });
        await this.redis.zrem(this.DELAY_QUEUE, raw);
        this.logger.log(`Dispatched delayed email at ${new Date(now).toISOString()}`);
      } catch (err) {
        this.logger.error(`Failed to dispatch message: ${err.message}`);
      }
    }
  }
}