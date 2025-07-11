import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ValidationPipe, BadRequestException, ParseIntPipe, NotFoundException, Res } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { SetAttachmentIdInterceptor } from '../interceptors/set-attachment-id.interceptor';
import { AuthGuard } from '../guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { createFileUploadStorage } from '../utils/upload-file.util';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    SetAttachmentIdInterceptor,
    FileInterceptor('file', {
      storage: createFileUploadStorage('attachments'),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body(ValidationPipe) createAttachmentDto: CreateAttachmentDto
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.attachmentsService.create(createAttachmentDto.data_item_id, createAttachmentDto.data_type_id,file);
  }

  @Get(':id/:hash')
  async findOne(
    @Param('id', ParseIntPipe) id: string,
    @Param('hash') hash: string,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.findOne(+id, hash);

    const filePath = path.resolve('./uploads', `${attachment.directory_name}${attachment.stored_filename}`);
    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
      throw new NotFoundException('File does not exist');
    }

    const stream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', attachment.content_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    return stream.pipe(res);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(+id);
  }
}
