import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards, ValidationPipe, Res } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';
import { ExcelService } from '../services/excel.service';

@UseGuards(AuthGuard)
@Controller('job-orders')
export class JobOrdersController {
  constructor(private readonly jobOrdersService: JobOrdersService, private readonly excelService: ExcelService) {}

  @Post()
  create(@Body(ValidationPipe) createJobOrderDto: CreateJobOrderDto) {
    return this.jobOrdersService.create(createJobOrderDto);
  }

  @Get()
  findAll(@Query() query : any) {
    return this.jobOrdersService.findAll(query);
  }

  @Get('get-selection')
  findJoborderListSelection() {
    return this.jobOrdersService.findJoborderListSelection();
  }

  @Get('export')
  async exportCsv(@Res() res: Response) {
    const joborders = await this.jobOrdersService.findJobordeToExport();
    
    const columns = [
      { header: 'ID', key: 'joborder_id' },
      { header: 'Company Job id', key: 'company_id' },
      { header: 'Title', key: 'title' },
      { header: 'Company', key: 'company_name' },
      { header: 'Department', key: 'department_name' },
      { header: 'Type', key: 'type' },
      { header: 'Status', key: 'status' },
      { header: 'Age', key: 'daysOld' },
      { header: 'Created', key: 'date_created' },
      { header: 'Modified', key: 'date_modified' },
      { header: 'In Pipeline', key: 'pipeline' },
      { header: 'Submitted', key: 'submitted' },
      { header: 'Owner', key: 'recruiter' },
      { header: 'Recruiter', key: 'owner' },
      { header: 'Contact', key: 'contact_name' },
      { header: 'Contact Phone', key: 'contact_phone' },
      { header: 'City', key: 'city' },
      { header: 'State', key: 'state' },
      { header: 'Max Rate', key: 'rate_max' },
      { header: 'Salary', key: 'salary' },
      { header: 'Duration', key: 'duration' },
      { header: 'Openings', key: 'openings' },
      { header: 'Misc Notes', key: 'notes' },
    ];

    const csvBuffer = await this.excelService.exportCsv(columns, joborders);
    const BOM = '\uFEFF'; // BOM for UTF-8
    const bufferWithBOM = Buffer.concat([Buffer.from(BOM), csvBuffer]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=job-orders.csv');
    res.send(bufferWithBOM);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findOne(+id);
  }

  @Get(':id/detail')
  findDetail(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findDetail(+id);
  }

  @Get(':id/attachments')
  findJobOrderAttachment(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findJobOrderAttachment(+id);
  }

  @Get(':id/pipelines')
  findJobOrderPipeline(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findJobOrderPipeline(+id);
  }

  @Get('companies/:id')
  findCompanyJobOrder(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findCompanyJobOrder(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateJobOrderDto: UpdateJobOrderDto) {
    return this.jobOrdersService.update(+id, updateJobOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.remove(+id);
  }
}
