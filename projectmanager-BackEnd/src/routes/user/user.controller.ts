import { Controller, Get, Post, Body, Patch, Param, Delete, Request, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    const userExist = await this.userService.findByEmail(createUserDto.email)
    if(userExist){
      throw new BadRequestException("User already exist in database")
    }

    return await this.userService.create(createUserDto);
  }

  @Patch()
  async update(@Request() req,@Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub
    return await this.userService.update(userId, updateUserDto);
  }

  @Delete()
  async delete(@Request() req) {
    const userId = req.user.sub
    return await this.userService.delete(userId);
  }

  @Get()
  async findAllUsers(){
    return await this.userService.findAll()
  }
}
