/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
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
  AccessibleFacility,
  RoomSpecFacility,
  ViewFacility,
} from '@prisma/client';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  areaTitle: string;

  @IsString()
  bedTitle: string;

  @IsString()
  windowTitle: string;

  @IsString()
  floorTitle: string;

  @IsString()
  smokeTitle: string;

  @IsOptional()
  @IsString()
  wifiInfo?: string;

  @IsString()
  pictureUrl: string;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsNumberString()
  price: string;

  @IsInt()
  @Min(1)
  totalStock: number;
}
