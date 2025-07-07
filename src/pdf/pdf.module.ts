import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PdfRedactionService } from '../services/pdf-redaction.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, PdfRedactionService],
})
export class PdfModule {}
