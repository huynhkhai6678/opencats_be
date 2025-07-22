// excel.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async exportCsv(columns : any[], data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Define columns
    worksheet.columns = columns;

    // Add data rows
    data.forEach(row => worksheet.addRow(row));

    // Write to buffer and return
    const buffer = await workbook.csv.writeBuffer();
    return Buffer.from(buffer.toString(), 'utf-8');
  }
}
