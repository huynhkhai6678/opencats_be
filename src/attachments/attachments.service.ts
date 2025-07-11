import { Inject, Injectable, NotFoundException, Res } from '@nestjs/common';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as md5 from 'md5';

@Injectable()
export class AttachmentsService {
  constructor(
      private readonly prisma: PrismaService,
      @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(dataItemId : number, dataItemType: number, file: Express.Multer.File) {
    const nameWithoutExtension = path.parse(file.originalname).name;
    const directoryName = file.destination.replace(/^uploads\//, '');
    const md5sum = await this.computeFileMD5(file.path);

    return await this.prisma.attachment.create({
      data : {
        data_item_id: dataItemId,
        data_item_type: dataItemType,
        title : nameWithoutExtension,
        original_filename: file.originalname,
        stored_filename: file.filename,
        content_type: file.mimetype,
        date_created: new Date(),
        date_modified: new Date(),
        directory_name: `${directoryName}/`,
        file_size_kb: (file.size / 1024),
        md5_sum: md5sum,
      }
    });
  }

  async findOne(id: number, hash: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        attachment_id: id,
      },
    });
    
    const directoryHash = md5(attachment?.directory_name)

    if (!attachment || directoryHash !== hash) {
      throw new NotFoundException('File not found or hash mismatch');
    }

    return attachment;
  }

  async remove(id: number) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        attachment_id: id,
      },
    })
    
    if (!attachment) {
      throw new NotFoundException('This attachemnt not existed');
    }

    await this.deleteFile(attachment.stored_filename, attachment.directory_name ?? '');

    await this.prisma.attachment.delete({
      where: {
        attachment_id: id
      },
    });

    return {
      message : `Delete attachment successfully`
    };
  }

  async deleteFile(stored_filename: string, directory_name: string): Promise<void> {
    const filePath = path.join(directory_name, stored_filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async computeFileMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('md5');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  }
}
