import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { CONSTANTS } from 'src/constants';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async canActivate(): Promise<boolean> {
    const userToken = this.request.user;
    const userDB = await this.prismaService.user.findUnique({
      where : {
        user_id : userToken.user_id
      }
    });

    if (!userDB || userDB.access_level != CONSTANTS.ACCESS_LEVEL_ROOT) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
