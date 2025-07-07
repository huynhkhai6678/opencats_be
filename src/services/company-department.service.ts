import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CompanyDepartmentService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REQUEST) private readonly request: any,
    ) {}

    async createDepartment(companyId : number, name: string) {
        const user = this.request.user;

        return await this.prisma.company_department.create({
            data: {
                company_id: companyId,
                name: name,
                site_id: 1,
                created_by: user.user_id,
                date_created : new Date()
            }
        });
    }
}