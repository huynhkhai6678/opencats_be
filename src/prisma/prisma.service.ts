import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // constructor() {
  //   super({
  //     log: ['query'], 
  //   });

  //     this.$use(async (params, next) => {
  //       const start = Date.now(); // Start time

  //       const result = await next(params); // Execute the query

  //       const duration = Date.now() - start; // Calculate the time taken
  //       console.log(`Query executed: ${params.model}.${params.action} in ${duration}ms`);

  //       return result; // Return the result
  //   });
  // }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}