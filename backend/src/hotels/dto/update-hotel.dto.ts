/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelDto } from './create-hotel.dto';

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}
