import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import * as bcrypt from "bcrypt"

const publicUserFields = { id: true, name: true, email: true, createdAt: true, updatedAt: true } as const

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createUserDto: Prisma.UserCreateInput) {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10)

    const user = await this.prisma.user.create({
      data: createUserDto,
      select: publicUserFields
    });
    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    if(updateUserDto.password){
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
    }

    return await this.prisma.user.update({
      where:{id:userId},
      data:updateUserDto,
      select: publicUserFields
    })
  }

  async findByEmail(email:string){
    return await this.prisma.user.findUnique({
      where:{email:email}
    })

  }

  async findAll() {
    return await this.prisma.user.findMany({
      where: {},
      select: { id: true, name: true, email: true }
    })
  }

  async userExist(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId }
    })
  }

  async delete(userId:number) {
    return await this.prisma.user.delete({where:{id:userId}, select: { id: true }})
  }
}
