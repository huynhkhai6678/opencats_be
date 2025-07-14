import { Module } from '@nestjs/common';
import { CandidateJoborderService } from './candidate-joborder.service';
import { CandidateJoborderController } from './candidate-joborder.controller';

@Module({
  controllers: [CandidateJoborderController],
  providers: [CandidateJoborderService],
})
export class CandidateJoborderModule {}
