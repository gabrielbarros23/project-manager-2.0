import { Global, Injectable, Module } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        super({ adapter });
    }
}


@Global()
@Module({
providers: [PrismaService],
exports: [PrismaService]
})
export class PrismaModule{}
