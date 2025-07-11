import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as md5 from 'md5';
import { ChangePasswordDto } from './dto/change-password.dto';
import { REQUEST } from '@nestjs/core';
import { first } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const hashedPassword = md5(password);

    const user = await this.prisma.user.findFirst({
      where: { 
        user_name : username 
      },
      include : {
        access : true
      }
    });

    if (!user || user.password !== hashedPassword) {
      throw new BadRequestException('Invalid username or password.');
    }

    const data = {
      user_id: user.user_id,
      user_name: user.user_name,
      access_level : user.access_level,
      access_role: user.access.short_description,
      can_change_password: user.can_change_password,
      is_demo: user.is_demo,
      first_name: user.first_name,
      last_name: user.last_name,
      can_see_eeo_info: user.can_see_eeo_info
    }

    const token = await this.jwtService.signAsync(data);
    
    return {
      data,
      token
    };
  }

  async changePassword(changePasswordDto : ChangePasswordDto): Promise<any> {
    const currentUser = this.request.user;
    const user = await this.prisma.user.findFirst({ 
      where : {
        user_id: currentUser?.user_id
      }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldPasswordHash = md5(changePasswordDto.old_password);
    if (!(user.password === oldPasswordHash)) {
      throw new BadRequestException('Old password is not correct');
    }

    const hashed: string = md5(changePasswordDto.new_password);
    await this.prisma.user.update({
      where: {
        user_id: currentUser.user_id
      },
      data: {
        password: hashed
      }
    })

    return {
      message: 'Change Password successfully'
    }
  }
}
