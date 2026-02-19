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
  ParseEnumPipe,
  //UseGuards,
} from '@nestjs/common';
import { PromotionType } from '@prisma/client';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { SearchHotelsDto } from './dto/search-hotels.dto';
import { HotelDetailQueryDto } from './dto/hotel-detail-query.dto';

@Controller('hotels')
//@UseGuards(JwtAuthGuard)
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateHotelDto) {
    return this.hotelsService.create(req.user.userId, dto);
  }

  @Get('search')
  search(@Query() query: SearchHotelsDto) {
    return this.hotelsService.search(query);
  }

  @Post('search')
  searchWithBody(@Body() body: SearchHotelsDto) {
    return this.hotelsService.search(body);
  }

  @Get('promotions')
  findByPromotion(
    @Query('type', new ParseEnumPipe(PromotionType)) type: PromotionType,
  ) {
    return this.hotelsService.listHotelsByPromotion(type);
  }

  @Get(':id/detail')
  detail(@Param('id') id: string, @Query() query: HotelDetailQueryDto) {
    return this.hotelsService.getHotelDetail(Number(id), query);
  }

  @Get('mine')
  mine(@Req() req: any) {
    return this.hotelsService.findMine(req.user.userId);
  }

  @Get(':id/public')
  findPublic(@Param('id') id: string) {
    return this.hotelsService.findByIdForUser(0, 'ADMIN', Number(id));
  }

  @Get(':id/private')
  findPrivate(@Req() req: any, @Param('id') id: string) {
    return this.hotelsService.findByIdForUser(
      req.user.userId,
      req.user.role,
      Number(id),
    );
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateHotelDto,
  ) {
    return this.hotelsService.update(req.user.userId, Number(id), dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.hotelsService.remove(req.user.userId, Number(id));
  }
}
