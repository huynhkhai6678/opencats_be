import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, ValidationPipe, Res } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';
import { ExcelService } from '../services/excel.service';

@UseGuards(AuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService, private readonly excelService: ExcelService) {}

  @Post()
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.contactsService.findAll(query);
  }

  @Get('export')
  async exportCsv(@Res() res: Response) {
    const contacts = await this.contactsService.findContactToExport();  
    const columns = [
      { header: 'First Name', key: 'first_name' },
      { header: 'Last Name', key: 'last_name' },
      { header: 'Company', key: 'company_name' },
      { header: 'Title', key: 'title' },
      { header: 'Department', key: 'department_name' },
      { header: 'Work Phone', key: 'phone_work' },
      { header: 'Cell Phone', key: 'phone_cell' },
      { header: 'Other Phone', key: 'phone_other' },
      { header: 'E-Mail', key: 'email1' },
      { header: '2nd E-Mail', key: 'email2' },
      { header: 'Address', key: 'address' },
      { header: 'City', key: 'city' },
      { header: 'State', key: 'state' },
      { header: 'Zip', key: 'zip' },
      { header: 'Misc Notes', key: 'notes' },
      { header: 'Owner', key: 'owner_name' },
      { header: 'Created', key: 'date_created' },
      { header: 'Modified', key: 'date_modified' },
    ];

    const csvBuffer = await this.excelService.exportCsv(columns, contacts);
    const BOM = '\uFEFF';
    const bufferWithBOM = Buffer.concat([Buffer.from(BOM), csvBuffer]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(bufferWithBOM);
  }
  

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.contactsService.findOne(+id);
  }

  @Get(':id/detail')
  findDetail(@Param('id', ParseIntPipe) id: string) {
    return this.contactsService.findDetail(+id);
  }

  @Get(':id/job-orders')
  findContactJobOrder(@Param('id', ParseIntPipe) id: string) {
    return this.contactsService.findContactJobOrder(+id);
  }

  @Get(':id/attachments')
  findCompanyAttachment(@Param('id', ParseIntPipe) id: string) {
    return this.contactsService.findContactAttachment(+id);
  }

  @Get(':id/company-contact')
  findCompanyContact(@Param('id', ParseIntPipe) id: string) {
    return this.contactsService.findCompanyContact(+id);
  }

  @Get(':id/activities')
  findActivities(@Param('id', ParseIntPipe) id: string) {
    return this.contactsService.findContactActivities(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateContactDto: UpdateContactDto) {
    return this.contactsService.update(+id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(+id);
  }
}
