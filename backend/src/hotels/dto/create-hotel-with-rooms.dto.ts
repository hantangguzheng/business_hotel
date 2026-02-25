/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateHotelDto } from './create-hotel.dto';
import { CreateRoomDto } from '../../rooms/dto/create-room.dto';

export class CreateHotelWithRoomsDto extends CreateHotelDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomDto)
  rooms?: CreateRoomDto[];
}
