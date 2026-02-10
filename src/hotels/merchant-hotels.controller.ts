/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HotelsService } from './hotels.service';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateHotelWithRoomsDto } from './dto/create-hotel-with-rooms.dto';

@Controller('api/merchant/hotels')
@UseGuards(JwtAuthGuard)
export class MerchantHotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateHotelWithRoomsDto) {
    return this.hotelsService.createForMerchant(req.user.userId, dto);
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateHotelDto,
  ) {
    return this.hotelsService.updateForMerchant(
      req.user.userId,
      Number(id),
      dto,
    );
  }

  @Get()
  listMine(@Req() req: any) {
    return this.hotelsService.listMine(req.user.userId);
  }
}
