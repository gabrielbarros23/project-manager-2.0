import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request, ForbiddenException, BadRequestException, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, SignedMemberDto, TaskFilterDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectService } from '../project/project.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService, private readonly projectService:ProjectService) { }

  @Post()
  async create( @Request() request,@Body() createTaskDto: CreateTaskDto) {
    const userId = request.user.sub
    const havePermission = await this.projectService.isOwnerOrAdminOfTheProject(userId,createTaskDto.projectId)
    if (!havePermission) {
      throw new ForbiddenException("you don't have the permission to create a task in this project")
    }

    const isUsersInProject = await this.projectService.isUsersInTheProject(createTaskDto.signedTo, createTaskDto.projectId)
    if(!isUsersInProject){
      throw new BadRequestException("not all of the members you are try to sign the task are in the project.")
    }

    return await this.taskService.create(createTaskDto);
  }

  @Patch(':taskId')
  async update(@Param('taskId') taskId: number,@Request() request, @Body() updateTaskDto: UpdateTaskDto) {
    const userId = request.user.sub

    return await this.taskService.update(taskId,userId,updateTaskDto);
  }

  @Post("/sign-member/:taskId")
  async signedMember( @Request() request, @Param("taskId",ParseIntPipe)taskId:number, @Body() body:SignedMemberDto){
    const userId = request.user.sub
    const taskData = await this.taskService.isOwnerOrAdminOfTheProject(taskId,userId)
    if(!taskData){
      throw new ForbiddenException("you don't have the permission to sign a member in the project")
    }

    const isMemberInProject = await this.projectService.isUsersInTheProject(body.membersIds, taskData.projectId)
    if(!isMemberInProject){
      throw new ForbiddenException("not all members are in the project")
    }

    return await this.taskService.signMembersToTask(body.membersIds,taskId)
  }

  @Delete("/unsigned-member/:taskId")
  async unsigned ( @Request() request, @Param("taskId",ParseIntPipe)taskId:number, @Body() body:SignedMemberDto){

    const userId = request.user.sub
    const taskData = await this.taskService.isOwnerOrAdminOfTheProject(taskId,userId)
    if(!taskData){
      throw new ForbiddenException("you don't have the permission to unsigned a member in this project")
    }

    return await this.taskService.unSignMembersToTask(body.membersIds,taskId)
  }

  @Delete(':taskId')
  async delete( @Request() request, @Param('taskId') taskId: number) {
    const userId = request.user.sub
    const taskData = await this.taskService.isOwnerOrAdminOfTheProject(taskId,userId)
    if(!taskData){
      throw new ForbiddenException("you don't have the permission to delete this task")
    }

    return await this.taskService.delete(taskId);
  }

  @Get()
  async search( @Request() request, @Query() filterOptions:TaskFilterDto) {
    const userId = request.user.sub

    return await this.taskService.filter(filterOptions,userId);
  }

  @Get(":taskId")
  async getTask( @Request() request, @Param("taskId",ParseIntPipe) taskId:number) {
    const userId = request.user.sub

    return await this.taskService.getTask(taskId,userId);
  }

}
