import { Type } from "class-transformer"
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { ProjectRole } from "src/generated/prisma/enums"


export class SearchProjectDto {
  @IsOptional()
  @IsString()
  search:string = ""

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  take: number = 10

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip: number = 0

  @IsOptional()
  @IsEnum(ProjectRole)
  roleFilter:ProjectRole 
}
