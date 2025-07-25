import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { AuthModule } from '../auth/auth.module';
import { HistoriesModule } from '../histories/histories.module';
import { CandidateSourceService } from '../services/candidate-source.service';
import { AttachmentsModule } from '../attachments/attachments.module';
import { ExcelService } from '../services/excel.service';

@Module({
  imports: [
    AuthModule,
    AttachmentsModule,
    HistoriesModule
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, CandidateSourceService, ExcelService],
})
export class CandidatesModule {}
