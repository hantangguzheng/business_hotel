/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import { PromotionType } from '@prisma/client';
import { RoomListItemDto } from '../../rooms/dto/room-response.dto';

export class HotelPromotionDto {
  id!: number;
  promotionType!: PromotionType;
  discount!: number;
  startDate!: Date;
  endDate!: Date;

  constructor(partial: Partial<HotelPromotionDto>) {
    Object.assign(this, partial);
  }
}

export class HotelListItemDto {
  id!: number;
  merchantId?: number;
  nameCn!: string;
  nameEn!: string;
  imageUrls!: string[];
  starRating!: number;
  score!: number;
  totalReviews!: number;
  price!: number;
  currency!: string;
  crossLinePrice?: number | null;
  status?: number;
  address?: string;
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  openingDate?: Date | string;
  shortTags?: string[];
  distance?: number | null;
  promotions?: HotelPromotionDto[];

  constructor(partial: Partial<HotelListItemDto>) {
    Object.assign(this, partial);
  }
}

export class HotelDetailDto extends HotelListItemDto {
  @Type(() => HotelPromotionDto)
  declare promotions: HotelPromotionDto[];

  @Type(() => RoomListItemDto)
  rooms!: RoomListItemDto[];

  constructor(partial: Partial<HotelDetailDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
