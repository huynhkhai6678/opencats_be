import { Module } from '@nestjs/common';
import { HeadhuntsService } from './headhunts.service';
import { HeadhuntsController } from './headhunts.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports : [
    AuthModule
  ],
  controllers: [HeadhuntsController],
  providers: [HeadhuntsService],
})
export class HeadhuntsModule {}
