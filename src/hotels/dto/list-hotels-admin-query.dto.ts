/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListHotelsAdminQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1, 2, 3])
  status?: number;

  @IsOptional()
  @IsString()
  cityCode?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
