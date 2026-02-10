/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('hotels/:hotelId/rooms')
  create(
    @Req() req: any,
    @Param('hotelId') hotelId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(req.user.userId, Number(hotelId), dto);
  }

  @Get('hotels/:hotelId/rooms')
  list(@Req() req: any, @Param('hotelId') hotelId: string) {
    return this.roomsService.listByHotel(
      req.user.userId,
      req.user.role,
      Number(hotelId),
    );
  }

  @Put('rooms/:id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(req.user.userId, Number(id), dto);
  }

  @Delete('rooms/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.roomsService.remove(req.user.userId, Number(id));
  }
}
