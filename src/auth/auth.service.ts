import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as md5 from 'md5';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const hashedPassword = md5(password);

    const user = await this.prisma.user.findFirst({
      where: { user_name : username },
    });

    if (!user || user.password !== hashedPassword) {
      throw new BadRequestException('Invalid username or password.');
    }

    const data = {
      user_id: user.user_id,
      user_name: user.user_name,
      access_level : user.access_level,
      can_change_password: user.can_change_password,
      is_demo: user.is_demo,
      can_see_eeo_info: user.can_see_eeo_info
    }

    const token = await this.jwtService.signAsync(data);
    
    return {
      data,
      token
    };
  }
}
