// pdf-redaction.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';


@Injectable()
export class PdfRedactionService {

  async redactSensitiveInfo(inputBuffer: Buffer, outputPath: string): Promise<void> {

    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');

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

      for (const item of content.items) {
        const str = (item as any).str as string;
        const transform = (item as any).transform as number[];

        const x = transform[4];
        const y = transform[5];
        const fontSize = transform[0]; // Approx font size from transform

        // Match sensitive info: email or phone (you can add more)
        if (this.isSensitive(str)) {
          const redactWidth = str.length * (fontSize * 0.6); // rough width estimate
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

    const outputBytes = await pdfDoc.save();
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, outputBytes);
  }

  private isSensitive(text: string): boolean {
    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}\b/;
    const phoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
    const vietnameseNameRegex = /\b(Nguyen|Tran|Le|Pham|Huynh|Dang|Hoang|Do|Vo|Bui)\b/i;

    return emailRegex.test(text) || phoneRegex.test(text) || vietnameseNameRegex.test(text);
  }
}