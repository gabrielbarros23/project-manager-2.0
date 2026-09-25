import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTaskDto, TaskFilterDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { ProjectRole, TaskStatus } from 'src/generated/prisma/enums';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto) {
    return await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        dueDate: createTaskDto.dueDate,
        priority: createTaskDto.priority,
        project: {
          connect:{
            id:createTaskDto.projectId
          }
        },
        status: createTaskDto.status ?? TaskStatus.TODO,
        signedTo: createTaskDto.signedTo ?
          {
            create: createTaskDto.signedTo.map(userID => ({
              user: {
                connect: { id: userID }
              }
            }
            ))
          } : undefined
      },
      include: { signedTo: true, project: true }
    })
  }

  async update(taskId: number, userId:number,updateTaskDto: UpdateTaskDto) {
    return await this.prisma.task.update({
      where:{
        id:taskId,
        project:{
          members:{
            some:{
              userId:userId,
              OR:[
                {role:ProjectRole.OWNER},
                {role:ProjectRole.ADMIN},
              ]
            }
          }
        }
      },
      data:updateTaskDto
    })
  }

  async signMembersToTask(membersId:number[],taskId:number){
    try{
      return await this.prisma.taskMembers.createMany({
        data:membersId.map(memberId => (
          {taskId:taskId,userId:memberId}
        ))
      })
    }catch(error){
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Member is already assigned to this task',
          );
        }
      }
    }

  }

  async  unSignMembersToTask(membersId:number[],taskId:number){
    return await this.prisma.taskMembers.deleteMany({
      where:{
        taskId:taskId,
        userId: {in: membersId}
      }
    })

  }

  async delete(taskId:number){
    return await this.prisma.task.delete({where:{id:taskId}})
  }

  async filter(filterOptions:TaskFilterDto,userId:number) {
    return await this.prisma.task.findMany({
      where: {
        OR:[
          {title:{contains:filterOptions.search}},
          {description:{contains:filterOptions.search}},
        ],
        priority:filterOptions.priority?? undefined,
        status:filterOptions.status ?? undefined,
        project:{
          members:{some:{userId:userId}},
          ...(filterOptions.projectIds.length > 0 ? {id:{in:filterOptions.projectIds}} : {})
        },
        ...(filterOptions.signedTo && filterOptions.signedTo.length > 0 ? {
          signedTo:{
            some:{
              userId:{
                in:filterOptions.signedTo
              }
            }
          }
          } :{})
      },
      take:filterOptions.take,
      skip:filterOptions.skip,
      include:{signedTo:true}
    })
  }
  async getTask(taskId:number,userId:number){
    return await this.prisma.task.findUnique({
      where:{
        id:taskId,
        project:{
          members:{
            some:{
              userId:userId
            }
          }
        }
      }
    })

  }

  async findAll() {
    const tasks = await this.prisma.task.findMany({ where: {} })
    const tasksMembers = await this.prisma.taskMembers.findMany({ where: {} })

    return { tasks, tasksMembers }
  }

  async isOwnerOrAdminOfTheProject(taskId:number,userId:number){
    return await this.prisma.task.findUnique({
      where:{
        id:taskId,
        project:{
          members:{
            some:{
              userId:userId,
              OR:[
                {role:ProjectRole.OWNER},
                {role:ProjectRole.ADMIN}
              ]
            }
          },
        }
      }
      //select:{projectId:true}
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }


  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
