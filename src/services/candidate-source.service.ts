import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CandidateSourceService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REQUEST) private readonly request: any,
    ) {}

    async createSource(name: string, headhuntId : number = 0) {
        const user = this.request.user;
        return await this.prisma.candidate_source.create({
            data: {
                name,
                site_id: 1,
                headhunt_id: headhuntId,
                date_created : new Date()
            }
        });
    }
}