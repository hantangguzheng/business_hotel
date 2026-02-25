import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { MerchantHotelsController } from './merchant-hotels.controller';
import { AdminHotelsController } from './admin-hotels.controller';
import { HotelsService } from './hotels.service';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  controllers: [
    HotelsController,
    MerchantHotelsController,
    AdminHotelsController,
  ],
  providers: [HotelsService, AdminGuard],
})
export class HotelsModule {}
