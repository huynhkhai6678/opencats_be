import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import { REQUEST } from '@nestjs/core';
import * as md5 from 'md5';
import { UserEntity } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashPassword = md5(createUserDto['password']);
    const user = await this.prisma.user.findFirst({
      where : {
        user_name : createUserDto.user_name
      }
    });

    if (user) {
      throw new BadRequestException('Username is existed');
    }

    await this.prisma.user.create({
      data: {
        email : createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        password: hashPassword,
        user_name: createUserDto.user_name,
        site_id: 1
      }
    });

    return {
      message: 'User created succesfully'
    };
  }

  async findAll(query : any) {
    const {
      sortField = 'user_id',
      sortOrder = 'asc',
      filter,
    } = query;
      
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['first_name', 'last_name', 'user_name', 'short_description'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'last_success';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql` WHERE (
        user.first_name LIKE ${'%' + filter + '%'}
        OR user.last_name LIKE ${'%' + filter + '%'}
        OR user.user_name LIKE ${'%' + filter + '%'}
        OR access_level.short_description LIKE ${'%' + filter + '%'}
      )`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<Array<any>>(Prisma.sql`
      SELECT
        user.user_id,
        user.first_name,
        user.last_name,
        user.user_name,
        access_level.short_description,
        latest_login_success.date AS last_success,
        latest_login_error.date AS last_fail 
      FROM user
      LEFT JOIN access_level 
        ON access_level.access_level_id = user.access_level
      LEFT JOIN (
        SELECT user_id, MAX(date) AS date
        FROM user_login
        WHERE successful = 1
        GROUP BY user_id
      ) AS latest_login_success 
        ON user.user_id = latest_login_success.user_id
      LEFT JOIN (
        SELECT user_id, MAX(date) AS date
        FROM user_login
        WHERE successful = 0
        GROUP BY user_id
      ) AS latest_login_error 
        ON user.user_id = latest_login_error.user_id
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM user
      LEFT JOIN access_level ON access_level.access_level_id = user.access_level
      ${whereClause}
    `);
    
    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where : {
        user_id : id
      }
    });

    const safeUser = plainToInstance(UserEntity, user, {
      excludeExtraneousValues: true,
    });

    return {
      data: safeUser,
      access_level : await this.prisma.access_level.findMany()
    };
  }

  async findDetail(id: number) {
    const data = await this.prisma.$queryRaw<Array<any>>(Prisma.sql`
      SELECT
        user.user_id,
        user.first_name,
        user.last_name,
        user.user_name,
        user.email,
        access_level.short_description,
        latest_login_success.date AS last_success,
        latest_login_error.date AS last_fail 
      FROM user
      LEFT JOIN access_level 
        ON access_level.access_level_id = user.access_level
      LEFT JOIN (
        SELECT user_id, MAX(date) AS date
        FROM user_login
        WHERE successful = 1
        GROUP BY user_id
      ) AS latest_login_success 
        ON user.user_id = latest_login_success.user_id
      LEFT JOIN (
        SELECT user_id, MAX(date) AS date
        FROM user_login
        WHERE successful = 0
        GROUP BY user_id
      ) AS latest_login_error 
        ON user.user_id = latest_login_error.user_id
      WHERE user.user_id = ${id}
    `);

    return {
      data : data[0]
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        user_id: id,
      },
    })
        
    if (!user) {
      throw new NotFoundException('This user not existed');
    }

    const updateDTO = {
      email : updateUserDto.email,
      first_name: updateUserDto.first_name,
      last_name: updateUserDto.last_name,
      user_name: updateUserDto.user_name,
    };

    if (updateUserDto.is_reset_password) {
      const hashPassword = md5(updateUserDto['password']);
      updateDTO['password'] = hashPassword;
    }

    await this.prisma.user.update({
      where: {
        user_id: id
      },
      data: updateDTO
    });

    return {
      message : `Update Job order successfully`
    };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        user_id: id,
      },
    })
        
    if (!user) {
      throw new NotFoundException('This user not existed');
    }

    await this.prisma.$transaction([
      this.prisma.user_login.deleteMany({
        where: {
          user_id: id
        },
      }),
      this.prisma.user.delete({
        where: {
          user_id: id
        },
      })
    ]);

    return {
      message : `Delete user successfully`
    };
  }

  async findActivities(id: number) {
    return {
      data : await this.prisma.user_login.findMany({
        where : {
          user_id: id
        },
        orderBy: {
          date: 'desc',
        },
        take: 20,
      })
    }
  }
}
