import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { ExternalApiController } from './external-api.controller';
import { AuthModule } from '../auth/auth.module';
import { ExternalJobsApiService } from './external-jobs-api.service';
import { ExternalAuthApiService } from './external-auth-api.service';
import { KafkaDelayService } from '../services/kafka-delay.service';
import { ExternalPipelineApiService } from './external-pipeline-api.service';
import { ExternalCandidateApiService } from './external-candidate-api.service';
import { HeadhuntsService } from '../headhunts/headhunts.service';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiService, ExternalJobsApiService, ExternalAuthApiService, ExternalPipelineApiService, ExternalCandidateApiService,KafkaDelayService, HeadhuntsService],
})
export class ExternalApiModule {}
