import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { HotelsService } from './hotels.service';
import { ListHotelsAdminQueryDto } from './dto/list-hotels-admin-query.dto';
import { RejectHotelDto } from './dto/reject-hotel.dto';

@Controller('api/admin/hotels')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminHotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  list(@Query() query: ListHotelsAdminQueryDto) {
    return this.hotelsService.listAllForAdmin(query);
  }

  @Post('approve-all')
  approveAllPending() {
    return this.hotelsService.approveAllPending();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.hotelsService.approveHotel(Number(id));
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectHotelDto) {
    return this.hotelsService.rejectHotel(Number(id), dto.auditReason);
  }

  @Post(':id/offline')
  offline(@Param('id') id: string) {
    return this.hotelsService.offlineHotel(Number(id));
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.hotelsService.restoreHotel(Number(id));
  }
}
