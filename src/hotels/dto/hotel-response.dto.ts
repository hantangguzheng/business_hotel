/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import { RoomListItemDto } from '../../rooms/dto/room-response.dto';

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

  constructor(partial: Partial<HotelListItemDto>) {
    Object.assign(this, partial);
  }
}

export class HotelDetailDto extends HotelListItemDto {
  @Type(() => RoomListItemDto)
  rooms!: RoomListItemDto[];

  constructor(partial: Partial<HotelDetailDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
