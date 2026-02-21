/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HotelTag } from '@prisma/client';

export class CreateHotelDto {
  @IsString()
  nameCn: string;

  @IsString()
  nameEn: string;

  @IsString()
  address: string;

  @Type(()=>Number)
  @IsInt()
  @Min(1)
  @Max(5)
  starRating: number;

  @IsString()
  cityCode: string;

  @IsDateString()
  openingDate: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  imageUrls?: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  score?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  totalReviews?: number;

  @IsNumberString()
  price: string;

  @IsOptional()
  @IsNumberString()
  crossLinePrice?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(HotelTag, { each: true })
  shortTags?: HotelTag[];

  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;
}
