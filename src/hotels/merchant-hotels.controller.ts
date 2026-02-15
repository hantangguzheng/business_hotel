/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HotelsService } from './hotels.service';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateHotelWithRoomsDto } from './dto/create-hotel-with-rooms.dto';
import { HOTEL_IMAGE_DIR, HOTEL_IMAGE_MAX_COUNT } from './hotel-media.config';

@Controller('api/merchant/hotels')
@UseGuards(JwtAuthGuard)
export class MerchantHotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  private static ensureUploadDir() {
    fs.mkdirSync(HOTEL_IMAGE_DIR, { recursive: true });
  }

  private static storage = diskStorage({
    destination: (req, file, cb) => {
      MerchantHotelsController.ensureUploadDir();
      cb(null, HOTEL_IMAGE_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  });

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', HOTEL_IMAGE_MAX_COUNT, {
      storage: MerchantHotelsController.storage,
    }),
  )
  create(
    @Req() req: any,
    @Body() dto: CreateHotelWithRoomsDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.hotelsService.createForMerchant(req.user.userId, dto, files);
  }

  @Post('from-url')
  createFromUrl(@Req() req: any, @Body() dto: CreateHotelWithRoomsDto) {
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
