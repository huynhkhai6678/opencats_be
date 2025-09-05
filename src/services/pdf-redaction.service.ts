// pdf-redaction.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import { Logger } from './logger.service';


@Injectable()
export class PdfRedactionService {
  private isNameFound = false;
  private isEmailFound = false;
  private isPhoneFound = false;
  private isAddressFound = false;

  constructor (private readonly logger : Logger) {}

  async redactSensitiveInfo(inputPath: string, outputPath: string, attachment : any) {

    this.isNameFound = false;
    this.isEmailFound = false;
    this.isPhoneFound = false;
    this.isAddressFound = false;

    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
    const inputBuffer = await fs.readFile(inputPath);

    // Step 1: Load PDF with pdfjs
    const loadingTask = pdfjsLib.getDocument({ data: inputBuffer });
    const pdf = await loadingTask.promise;

    // Step 2: Load PDF with pdf-lib (for editing)
    const pdfDoc = await PDFDocument.load(inputBuffer);
    const pages = pdfDoc.getPages();

    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
      const page = await pdf.getPage(pageIndex + 1);
      const content = await page.getTextContent();
      const pdfLibPage = pages[pageIndex];

      const lines: Record<number, { str: string; x: number; y: number; fontSize: number }[]> = {};
      // Group text have same Y into 1 line
      for (const item of content.items) {
        const { str, transform } = item as any;
        const x = transform[4];
        const y = Math.floor(transform[5]);
        const fontSize = transform[0];

        if (!lines[y]) lines[y] = [];
        lines[y].push({ str, x, y, fontSize });
      }

      const sortedLineEntries = Object.entries(lines).sort((a, b) => Number(b[0]) - Number(a[0]));

      for (const [lineY, items] of sortedLineEntries) {
        const sorted = items.sort((a, b) => a.x - b.x);
        const fullLineText = sorted.map(i => i.str).join('').trim();
        this.logger.log(fullLineText);

        if (this.isSensitive(fullLineText)) {
          // Redact all items that belong to the sensitive line
          for (const { str, x, y, fontSize } of sorted) {
            const redactWidth = str.length * (fontSize * 0.6);
            const redactHeight = fontSize + 2;

            pdfLibPage.drawRectangle({
              x,
              y,
              width: redactWidth,
              height: redactHeight,
              color: rgb(0, 0, 0),
            });
          }
        }
      }
    }

    const outputBytes = await pdfDoc.save();
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, outputBytes);

    const file = {
      filename: `redacted_${attachment.stored_filename}`,
      originalname: attachment.original_filename,
      encoding: 'utf-8',
      title: attachment.title,
      mimetype: attachment.content_type,
      destination: attachment.directory_name,
      buffer: Buffer.from(outputBytes), 
      size: outputBytes.length,
      path: outputPath
    };

    return file;
  }

  isSensitive(text: string): boolean {
    text = text.trim();
    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}\b/;
    const phoneRegex = /(?:\+84|84|0)\s?(?:\d\s?){9,11}\b/;

    const vietnameseNameRegex = /\b(nguyễn|trần|lê|phạm|hoàng|huỳnh|phan|vũ|võ|đặng|bùi|đỗ|hồ|ngô|dương|lý|đoàn)\b/i;
    // const vietnamAddressRegex = /\b(?<!\d{4}\s*-\s*)(\d{1,3}(?:\/\d{1,3})?\s*(?:đường|duong|st|đ|d|d\.|đ\.)?\s*[\w\s\-\/]+(?:,\s*(?:phường|p\.?|phuong)?\s*[\w\s\-\/]+)?(?:,\s*(?:quận|q\.?|quan)?\s*[\w\s\-\/]+)?(?:,\s*(?:thành phố|tp\.?|city)?\s*[\w\s\-\/]+)?(?:,\s*(?:việt nam|vietnam))?)/giu;

    if (!this.isEmailFound && emailRegex.test(text)) {
      this.logger.log('Email detected: ' + text);
      this.isEmailFound = true;
      return true;
    }

    if (!this.isPhoneFound && phoneRegex.test(text)) {
      this.logger.log('Phone number detected: ' + text);
      this.isAddressFound = true;
      return true;
    }

    if (!this.isNameFound && vietnameseNameRegex.test(text)) {
      this.logger.log('Vietnamese name detected: ' + text);
      this.isNameFound = true;
      return true;
    }

    // if (!this.isAddressFound && vietnamAddressRegex.test(text)) {
    //   this.logger.log('Address name detected: ' + text);
    //   this.isAddressFound = true;
    //   return true;
    // }

    return false;
  }
}