import { Module } from '@nestjs/common';
import { HeadhuntsService } from './headhunts.service';
import { HeadhuntsController } from './headhunts.controller';

@Module({
  controllers: [HeadhuntsController],
  providers: [HeadhuntsService],
})
export class HeadhuntsModule {}
