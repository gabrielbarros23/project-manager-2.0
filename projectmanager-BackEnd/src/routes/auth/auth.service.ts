import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma:PrismaService,
        private readonly jwtService:JwtService,
    ){}
    async login(credentials: LoginAuthDto) {
        const user = await this.prisma.user.findUnique({
            where:{email:credentials.email}
        })

        if(!user){
            throw new UnauthorizedException("email or password wrong")
        }

        if (!await bcrypt.compare(credentials.password,user.password)) {
            throw new UnauthorizedException("email or password wrong")
        }

        const payload =  {sub:user.id,email:user.email}
        const token = await this.jwtService.signAsync(payload) 

        return {token,userId:user.id}
    }


    async me(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, createdAt: true }
        })

        if (!user) {
            throw new UnauthorizedException()
        }

        return user
    }

    findAll() {
        return `This action returns all auth`;
    }

    findOne(id: number) {
        return `This action returns a #${id} auth`;
    }

    update(id: number, updateAuthDto: UpdateAuthDto) {
        return `This action updates a #${id} auth`;
    }

    remove(id: number) {
        return `This action removes a #${id} auth`;
    }
}
