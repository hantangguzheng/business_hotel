/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateHotelDto {
  @IsString()
  nameCn: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsString()
  address: string;

  @IsInt()
  @Min(1)
  @Max(5)
  starRating: number;

  @IsString()
  cityCode: string;

  @IsOptional()
  tags?: any; // Json：先放宽，后面可改成 string[]

  @IsOptional()
  @IsDateString()
  openingDate?: string;
}
