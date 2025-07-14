import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ListsService {

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createListDto: CreateListDto) {
    const user = this.request.user;
    const { data_item_type, description, entries } = createListDto;
    const now = new Date();

    await this.prisma.saved_list.create({
      data: {
        description,
        data_item_type,
        site_id: 1,
        created_by: user.user_id,
        date_created: now,
        number_entries: entries.length,
        entries: {
          create: entries.map(data_item_id => ({
            data_item_id,
            data_item_type,
            site_id : 1,
            date_created: now
          }))
        }
      },
      include: {
        entries: true
      }
    });

    return {
      message: 'List created succesfully'
    };
  }

  async findAll(query : any) {
    const {
      sortField = 'saved_list_id',
      sortOrder = 'asc',
      filter,
    } = query;
  
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['number_entries', 'description', 'type', 'is_dynamic'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'saved_list_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql`WHERE (saved_list.description LIKE ${'%' + filter + '%'})`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<{
        parameters: string;
        datagrid_instance: string;
        is_dynamic: number;
        number_entries: number;
        owner: string | null;
        saved_list_id: number;
        type: string;
      }>
    >(Prisma.sql`
      SELECT
        saved_list.*,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner,
        data_item_type.short_description as type
      FROM saved_list
      LEFT JOIN user AS owner_user ON saved_list.created_by = owner_user.user_id
      LEFT JOIN data_item_type ON data_item_type.data_item_type_id = saved_list.data_item_type
      ${whereClause}
      GROUP BY saved_list.saved_list_id
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM saved_list
    `);
    
    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    return {
      data : await this.prisma.saved_list.findFirst({
        where : {
          saved_list_id : id
        }
      }),
      options : await this.prisma.data_item_type.findMany()
    }
  }

  async findItem(id: number) {
    let data : any[] = [];
    switch(id) {
      case 100 :
        data = await this.prisma.$queryRaw`
          SELECT candidate_id AS value, full_name AS label FROM candidate
        `;
        break;
      case 200 :
        data = await this.prisma.$queryRaw`
          SELECT company_id AS value, name AS label FROM company
        `;
        break;

      case 300 :
        data = await this.prisma.$queryRaw`
          SELECT contact_id AS value, 
          CONCAT(contact.first_name, ' ',contact.last_name) AS label FROM contact
        `;
        break;

      case 400 :
        data = await this.prisma.$queryRaw`
          SELECT joborder_id AS value, title AS label FROM joborder
        `;
        break;
    }
 
    return {
      data
    }
  }

  async update(id: number, updateListDto: UpdateListDto) {
    const user = this.request.user;
    const contact = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: id,
      },
    })
    
    if (!contact) {
      throw new NotFoundException('This List not existed');
    }

    const { data_item_type, description, entries } = updateListDto;
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.saved_list.update({
        where: { saved_list_id: id },
        data: { entries: { deleteMany: {} } }
      }),
      this.prisma.saved_list.update({
        where: { saved_list_id: id },
        data: {
          description,
          data_item_type,
          entries: {
            create: entries?.map(data_item_id => ({
              data_item_id,
              data_item_type,
              site_id: 1,
              date_created: now,
            }))
          }
        }
      })
    ]);

    return {
      message : `Update list successfully`
    };
  }

  async remove(id: number) {
    const contact = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: id,
      },
    })
    
    if (!contact) {
      throw new NotFoundException('This List not existed');
    }

    await this.prisma.$transaction([
      this.prisma.saved_list_entry.deleteMany({
        where: { saved_list_id: id }
      }),
      this.prisma.saved_list.delete({
        where: { saved_list_id: id }
      })
    ]);

    return {
      message : `Delete list successfully`
    };
  }

  async findDetail(id: number, query : any) {
    const list = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: id,
      },
    })
    
    if (!list) {
      throw new NotFoundException('This List not existed');
    }
 
    return {
      data : list
    };
  }
}
