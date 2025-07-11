import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path

@Injectable()
export class SetAttachmentIdInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    const latest = await this.prisma.attachment.findFirst({
      orderBy: { attachment_id: 'desc' },
      select: { attachment_id: true },
    });

    req.attachmentId = latest?.attachment_id ?? 0;

    return next.handle();
  }
}