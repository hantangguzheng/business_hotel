/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum HotelSearchSort {
  distance = 'distance',
  price = 'price',
  score = 'score',
}

const AREA_TITLES = ['less35', '35-50', '50above'] as const;
const BED_TITLES = ['single', 'double', 'twin', 'king', 'others'] as const;
const WINDOW_TITLES = ['y', 'n'] as const;
const SMOKE_TITLES = ['y', 'n'] as const;
const WIFI_OPTIONS = ['y', 'n'] as const;

const transformToArray = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value : [value];
};

class HotelRoomTagFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(AREA_TITLES, { each: true })
  areaTitles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(BED_TITLES, { each: true })
  bedTitles?: string[];

  @IsOptional()
  @IsString()
  @IsIn(WINDOW_TITLES)
  window?: string;

  @IsOptional()
  @IsString()
  @IsIn(SMOKE_TITLES)
  smoke?: string;

  @IsOptional()
  @IsString()
  @IsIn(WIFI_OPTIONS)
  wifi?: string;
}

class HotelRoomFacilityFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cleaningFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bathingFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  layoutFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibleFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  networkFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bathroomFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  childFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roomSpecFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kitchenFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityFacilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  viewFacilities?: string[];
}

class HotelRoomFiltersDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => HotelRoomTagFiltersDto)
  tags?: HotelRoomTagFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HotelRoomFacilityFiltersDto)
  facilities?: HotelRoomFacilityFiltersDto;
}

export class SearchHotelsDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  cityCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minStar?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxStar?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minScore?: number;

  @IsOptional()
  @Transform(transformToArray, { toClassOnly: true })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userLng?: number;

  @IsOptional()
  @IsEnum(HotelSearchSort)
  sortBy?: HotelSearchSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => HotelRoomFiltersDto)
  room?: HotelRoomFiltersDto;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomsNeeded?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  peopleNeeded?: number;
}
