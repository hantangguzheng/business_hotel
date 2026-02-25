/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  MinLength,
} from 'class-validator';
import { PromotionType } from '@prisma/client';

export class CreateHotelPromotionDto {
  @IsEnum(PromotionType)
  promotionType!: PromotionType;

  @IsNumberString()
  @MinLength(1)
  discount!: string; // 0.01~1.0，字符串形式方便 Decimal

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
