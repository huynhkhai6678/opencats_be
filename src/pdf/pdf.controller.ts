import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { PdfRedactionService } from 'src/services/pdf-redaction.service';
import * as fs from 'fs/promises';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService, private readonly pdfRedactionService: PdfRedactionService) {}

  @Post('redact')
  @UseInterceptors(FileInterceptor('file'))
  async redact(@UploadedFile() file: Express.Multer.File) {
    const inputName = file.originalname;
    const redactedName = `redacted_${inputName}`;
    const outputPath = path.resolve('uploads', redactedName);

    await this.pdfRedactionService.redactSensitiveInfo(file.buffer, outputPath);

    const fileBuffer = await fs.readFile(outputPath);
    return {
      message: 'PDF redacted successfully',
      filename: redactedName,
    };
  }
}
