/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  AccessibleFacility,
  AmenityFacility,
  BathroomFacility,
  BathingFacility,
  ChildFacility,
  CleaningFacility,
  FoodFacility,
  KitchenFacility,
  LayoutFacility,
  MediaFacility,
  NetworkFacility,
  RoomSpecFacility,
  ViewFacility,
} from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const AREA_TITLES = ['小于35', '35-50', '50以上'] as const;
const BED_TITLES = [
  '单人床',
  '双人床',
  '双单人床',
  '双双人床',
  '其他',
] as const;
const WINDOW_TITLES = ['有', '无'] as const;
const SMOKE_TITLES = ['可吸烟', '禁烟'] as const;
const WIFI_OPTIONS = ['有', '无'] as const;

export class RoomTagFiltersDto {
  @IsOptional()
  @IsArray()
  @IsIn(AREA_TITLES, { each: true })
  areaTitles?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(BED_TITLES, { each: true })
  bedTitles?: string[];

  @IsOptional()
  @IsIn(WINDOW_TITLES)
  window?: string;

  @IsOptional()
  @IsIn(SMOKE_TITLES)
  smoke?: string;

  @IsOptional()
  @IsIn(WIFI_OPTIONS)
  wifi?: string;
}

export class RoomFacilityFiltersDto {
  @IsOptional()
  @IsArray()
  @IsEnum(CleaningFacility, { each: true })
  cleaningFacilities?: CleaningFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(BathingFacility, { each: true })
  bathingFacilities?: BathingFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(LayoutFacility, { each: true })
  layoutFacilities?: LayoutFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(AccessibleFacility, { each: true })
  accessibleFacilities?: AccessibleFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(NetworkFacility, { each: true })
  networkFacilities?: NetworkFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(BathroomFacility, { each: true })
  bathroomFacilities?: BathroomFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(FoodFacility, { each: true })
  foodFacilities?: FoodFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(ChildFacility, { each: true })
  childFacilities?: ChildFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(MediaFacility, { each: true })
  mediaFacilities?: MediaFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(RoomSpecFacility, { each: true })
  roomSpecFacilities?: RoomSpecFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(KitchenFacility, { each: true })
  kitchenFacilities?: KitchenFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(AmenityFacility, { each: true })
  amenityFacilities?: AmenityFacility[];

  @IsOptional()
  @IsArray()
  @IsEnum(ViewFacility, { each: true })
  viewFacilities?: ViewFacility[];
}

export class SearchRoomsDto {
  @Type(() => Number)
  @IsInt()
  hotelId: number;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => RoomTagFiltersDto)
  tags?: RoomTagFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoomFacilityFiltersDto)
  facilities?: RoomFacilityFiltersDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}
