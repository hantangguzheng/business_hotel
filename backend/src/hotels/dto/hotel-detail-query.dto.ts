/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsDateString } from 'class-validator';

export class HotelDetailQueryDto {
  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;
}
