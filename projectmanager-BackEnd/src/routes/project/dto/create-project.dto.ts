import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Min, MinLength } from "class-validator";
import { ProjectRole } from "src/generated/prisma/enums";

export class CreateProjectDto {
  @IsString()
  @Length(3, 50)
  title: string

  @IsString()
  @Length(3, 200)
  description: string
}


export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class AddUserToProjectDto {
  @IsNumber()
  @Min(0)
  projectId: number

  @IsNumber()
  @Min(0)
  memberId:number

  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole
}

export class RemoveMemberDto{
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  projectId: number

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  memberId:number
}

export class ModifyUserToProjectDto extends AddUserToProjectDto {}
