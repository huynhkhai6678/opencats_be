import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, ValidationPipe } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.contactsService.findAll(query);
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

  @Get('company-contact/:id')
  findCompanyContact(@Param('id', ParseIntPipe) id: string) {
    return this.contactsService.findCompanyContact(+id);
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
