import { Controller, Get, Post, Body, Patch, Param, Delete, Request, BadRequestException, ForbiddenException, NotFoundException, Put, ParseIntPipe, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AddUserToProjectDto, CreateProjectDto, ModifyUserToProjectDto as ModifyUserRoleDto, RemoveMemberDto, UpdateProjectDto } from './dto/create-project.dto';
import { ProjectRole } from 'src/generated/prisma/enums';
import { Public } from 'src/decorators/public.decorator';
import { SearchProjectDto } from './dto/search-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService,
  ) {}

  //create
  @Post()
  async create(@Request() request, @Body() createProjectDto: CreateProjectDto) {
    const userId = request.user.sub
    return await this.projectService.create(createProjectDto, userId);
  }

  //update
  @Patch(':projectId')
  async update( @Param('projectId',ParseIntPipe) projectId: number, @Request() request, @Body() updateProjectDto: UpdateProjectDto) {
    const userId = request.user.sub
    return await this.projectService.update(projectId,userId, updateProjectDto);
  }

  //remove Member
  @Delete("/removeMember")
  async removeMember(@Request() request, @Body() removeMemberDto:RemoveMemberDto) {
    console.log("alo")
    const userId = request.user.sub
    const havePermission = await this.projectService.isOwnerOrAdminOfTheProject(userId,removeMemberDto.projectId)

    if (!havePermission) {
      throw new ForbiddenException("you don't have the permission to remove a user in this project")
    }

    return await this.projectService.removeMember(removeMemberDto);
  }

  @Delete(":projectId")
  async deleteProject(@Request() request, @Param('projectId',ParseIntPipe) projectId: number) {
    const userId = request.user.sub

    return await this.projectService.deleteProject(projectId,userId);
  }

  //add user
  @Post("add-member")
  async addUserToProject(@Request() request, @Body() body: AddUserToProjectDto) {
    const requestUserId = request.user.sub
    const havePermission = await this.projectService.isOwnerOrAdminOfTheProject(requestUserId, body.projectId)

    if (!havePermission) {
      throw new ForbiddenException("you don't have the permission to add a user in this project")
    }

    return await this.projectService.addUserToProject(body);
  }


  //modify member role
  @Put("change-role")
  async modifyRole(@Request() request, @Body() body: ModifyUserRoleDto) {
    const userId = request.user.sub
    const havePermission = await this.projectService.isOwnerOfTheProject(userId, body.projectId)

    if (!havePermission) {
      throw new ForbiddenException("you don't have the permission to modify a user in this project")
    }

    if (body.role === ProjectRole.OWNER) {
      throw new BadRequestException("you can't pass the owner role to another user")
    }

    return await this.projectService.modifyUserRoleToProject(body);
  }



  @Public()
  @Get("getAll")
  async findAll() {
    return await this.projectService.findAll();
  }

  @Get()
  async searchMyProjects( @Request() request, @Query() searchParams:SearchProjectDto) {
    const userId = request.user.sub
    return await this.projectService.search(userId,searchParams);
  }

  @Get(':projectID')
  async findOne(@Request() request, @Param('projectID',ParseIntPipe) projectID: number) {
    const project = await this.projectService.findOne(projectID, request.user.sub)
    if (!project) {
      throw new NotFoundException("project not found")
    }
    return project
  }

}
