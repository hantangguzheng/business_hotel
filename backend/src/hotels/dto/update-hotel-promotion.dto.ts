/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelPromotionDto } from './create-hotel-promotion.dto';
import { IsOptional } from 'class-validator';

export class UpdateHotelPromotionDto extends PartialType(
  CreateHotelPromotionDto,
) {
  @IsOptional()
  promotionType?: CreateHotelPromotionDto['promotionType'];

  @IsOptional()
  discount?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;
}
