/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsInt, IsNumberString, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  roomName: string;

  // Prisma Decimal 最稳是前端传字符串 "199.99"
  @IsNumberString()
  price: string;

  @IsNumberString()
  originalPrice: string;

  @IsInt()
  @Min(0)
  stock: number;
}
