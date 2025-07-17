import { Module } from '@nestjs/common';
import { CandidateJoborderService } from './candidate-joborder.service';
import { CandidateJoborderController } from './candidate-joborder.controller';
import { ActivitiesModule } from '../activities/activities.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ActivitiesModule
  ],
  controllers: [CandidateJoborderController],
  providers: [CandidateJoborderService],
  exports : [CandidateJoborderService]
})
export class CandidateJoborderModule {}
