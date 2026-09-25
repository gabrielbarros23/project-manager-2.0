import { OmitType, PartialType } from "@nestjs/mapped-types";
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, ArrayNotEmpty, arrayNotEmpty, IsArray, IsDate, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Min, ValidateNested } from "class-validator";
import { min } from "rxjs";
import { TaskPriority, TaskStatus } from "src/generated/prisma/enums";

export class CreateTaskDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  projectId:number

  @IsString()
  @Length(3, 50)
  title: string

  @IsString()
  @Length(3, 200)
  description: string

  @IsNotEmpty()
  @IsEnum(TaskPriority)
  priority: TaskPriority

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: string

  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  signedTo: number[] 

  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus

}

//na query string um único valor chega como string ("?projectIds=1"), vários chegam como array
const toNumberArray = ({ value }: { value: unknown }) =>
  value === undefined ? undefined : ([] as unknown[]).concat(value).map(Number)

export class SignedMemberDto{
  @IsArray()
  @IsNumber({},{each:true})
  @Min(0,{each:true})
  membersIds:number[]
}

export class TaskFilterDto extends PartialType(OmitType(CreateTaskDto,["title","projectId","description","dueDate"] as const )){
  @IsOptional()
  @IsString()
  search:string = ""

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  take: number = 20

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip: number = 0

  @IsOptional()
  @Transform(toNumberArray)
  @IsArray()
  @IsNumber({},{each:true})
  @Min(0,{each:true})
  projectIds:number[] = []

  @IsOptional()
  @Transform(toNumberArray)
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  signedTo?: number[]
}
