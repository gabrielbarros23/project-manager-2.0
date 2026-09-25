import { Injectable } from '@nestjs/common';
import { AddUserToProjectDto, CreateProjectDto, ModifyUserToProjectDto, RemoveMemberDto, UpdateProjectDto } from './dto/create-project.dto';
import { ProjectRole } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { SearchProjectDto } from './dto/search-project.dto';

const memberUser = { id: true, name: true, email: true } as const

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProjectDto: CreateProjectDto, userId: number) {
    return await this.prisma.project.create({
      data: {
        title: createProjectDto.title,
        description: createProjectDto.description,
        members: {
          create: {
            role: ProjectRole.OWNER,
            user: {
              connect: { id: userId }
            }
          }
        }
      },
      include: { members: true }
    })
  }

  async update(projectId: number, userId:number,updateProjectDto: UpdateProjectDto) {
    return await this.prisma.project.updateMany({
      where:{id:projectId,
        members:{
          some:{
            userId:userId,
            OR:[
              {role:ProjectRole.OWNER},
              {role:ProjectRole.ADMIN}
            ]
          }
        }
      },
      data:updateProjectDto
    })
  }

  async deleteProject(projectId:number,userId:number) {
    return await this.prisma.project.deleteMany({
      where:{
        id:projectId,
        members:{
          some:{
            userId:userId,
            role:ProjectRole.OWNER
          }
        }
      }
    })
  }

  async addUserToProject(data: AddUserToProjectDto) {
    return await this.prisma.projectMembers.create({
      data: {
        role: data.role,
        projectId: data.projectId,
        userId:data.memberId,
      },
    })
  }

  async modifyUserRoleToProject(data: ModifyUserToProjectDto) {
    return await this.prisma.projectMembers.update({
      where: {
        userId_projectId: { userId:data.memberId, projectId: data.projectId }
      },
      data: {
        role: data.role,
      },
    })
  }

  async isOwnerOrAdminOfTheProject(userId: number, projectId: number) {
    return await this.prisma.projectMembers.findUnique({
      where: {
        userId_projectId: { userId: userId, projectId: projectId },
        OR: [
          { role: ProjectRole.OWNER },
          { role: ProjectRole.ADMIN }
        ]
      }
    })

  }

  async isOwnerOfTheProject(userId: number, projectId: number) {
    return await this.prisma.projectMembers.findUnique({
      where: {
        userId_projectId: { userId: userId, projectId: projectId },
        role: ProjectRole.OWNER
      }
    })

  }

  async findAll() {
    return await this.prisma.project.findMany({
      where: {},
      include:{members:true,tasks:true}
    })
  }

  async search(userId:number,searchParams:SearchProjectDto){
    return await this.prisma.project.findMany({
      where:{
        OR:[
          {title:{contains:searchParams.search}},
          {description:{contains:searchParams.search}},
        ],
        members:{
          some:{
            userId:userId,
            role:searchParams.roleFilter
          }
        }
      },
      take:searchParams.take,
      skip:searchParams.skip,
      include:{
        members:{include:{user:{select:memberUser}}},
        tasks:{select:{id:true,status:true}}
      }
    },
    )
  }

  async getUserProject(userId:number){
    return await this.prisma.projectMembers.findMany({
      where:{userId:userId},
      select:{projectId:true}
    }).then(response => response.map(data => data.projectId))
  }


  async findOne(projectId: number, userId: number) {
    return await this.prisma.project.findFirst({
      where:{
        id:projectId,
        members:{some:{userId:userId}}
      },
      include:{
        members:{include:{user:{select:memberUser}}},
        tasks:{include:{signedTo:true},orderBy:{dueDate:'asc'}}
      }
    })
  }


  async removeMember(removeMemberDto: RemoveMemberDto) {
    return await this.prisma.projectMembers.delete({
      where:{
        userId_projectId:{
          projectId:removeMemberDto.projectId,
          userId:removeMemberDto.memberId
        }
      }
    })
  }


  async isUsersInTheProject(usersId:number[],projectId:number){
    if(usersId.length == 0){
      return true
    }

    return await this.prisma.projectMembers.count({
      where:{
        userId:{in: usersId},
        projectId:projectId
      }
    }) === usersId.length ? true : false

  }

}
