import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ValidationPipe, Req, ParseIntPipe, Res } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';
import { ExcelService } from '../services/excel.service';

@UseGuards(AuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService, private readonly excelService: ExcelService) {}

  @Post()
  create(@Body(ValidationPipe) createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.companiesService.findAll(query);
  }

  @Get('export')
  async exportCsv(@Res() res: Response) {
    const companies = await this.companiesService.findCompanyToExport();

    const columns = [
      { header: 'Name', key: 'name' },
      { header: 'Phone', key: 'phone1' },
      { header: 'Phone 2', key: 'phone2' },
      { header: 'City', key: 'city' },
      { header: 'State', key: 'state' },
      { header: 'Zip', key: 'zip' },
      { header: 'Web Site', key: 'web_site' },
      { header: 'Owner', key: 'owner_name' },
      { header: 'Contact', key: 'date_modified' },
      { header: 'Created', key: 'date_created' },
      { header: 'Modified', key: 'date_modified' },
      { header: 'Misc Notes', key: 'notes' },
    ];

    const csvBuffer = await this.excelService.exportCsv(columns, companies);
    const BOM = '\uFEFF';
    const bufferWithBOM = Buffer.concat([Buffer.from(BOM), csvBuffer]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=companies.csv');
    res.send(bufferWithBOM);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findOne(+id);
  }

  @Get(':id/contacts')
  findCompanyContact(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findCompanyContact(+id);
  }

  @Get(':id/job-orders')
  findCompanyJobOrder(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findCompanyJobOrder(+id);
  }

  @Get(':id/attachments')
  findCompanyAttachment(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findCompanyAttachment(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
