/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
//import { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { ROOM_IMAGE_DIR } from '../hotels/hotel-media.config';
import { RoomDetailQueryDto } from './dto/room-detail-query.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  private static ensureUploadDir() {
    fs.mkdirSync(ROOM_IMAGE_DIR, { recursive: true });
  }

  private static storage = diskStorage({
    destination: (req, file, cb) => {
      RoomsController.ensureUploadDir();
      cb(null, ROOM_IMAGE_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  });

  @Post('hotels/:hotelId/rooms')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: RoomsController.storage,
    }),
  )
  create(
    @Req() req: any,
    @Param('hotelId') hotelId: string,
    @Body() dto: CreateRoomDto,
    @UploadedFile() file?: any,
  ) {
    return this.roomsService.create(
      req.user.userId,
      Number(hotelId),
      dto,
      file,
    );
  }

  @Post('hotels/:hotelId/rooms/from-url')
  createFromUrl(
    @Req() req: any,
    @Param('hotelId') hotelId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(
      req.user.userId,
      Number(hotelId),
      dto,
      undefined,
    );
  }

  @Get('hotels/:hotelId/rooms')
  list(@Req() req: any, @Param('hotelId') hotelId: string) {
    return this.roomsService.listByHotel(
      req.user.userId,
      req.user.role,
      Number(hotelId),
    );
  }

  @Get('rooms/:id/detail')
  detail(@Param('id') id: string, @Query() query: RoomDetailQueryDto) {
    return this.roomsService.getRoomDetail(Number(id), query);
  }

  @Put('rooms/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: RoomsController.storage,
    }),
  )
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @UploadedFile() file?: any,
  ) {
    return this.roomsService.update(req.user.userId, Number(id), dto, file);
  }

  @Delete('rooms/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.roomsService.remove(req.user.userId, Number(id));
  }

  @Post('rooms/search')
  search(@Body() dto: SearchRoomsDto) {
    return this.roomsService.search(dto);
  }
}
