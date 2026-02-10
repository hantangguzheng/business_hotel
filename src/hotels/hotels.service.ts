/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateHotelWithRoomsDto } from './dto/create-hotel-with-rooms.dto';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAllForAdmin(filters: {
    status?: number;
    cityCode?: string;
    keyword?: string;
  }) {
    const where: Prisma.HotelWhereInput = {};
    if (typeof filters.status === 'number') {
      where.status = filters.status;
    }
    if (filters.cityCode) {
      where.cityCode = filters.cityCode;
    }
    if (filters.keyword) {
      const keywordFilter = {
        contains: filters.keyword,
        mode: 'insensitive' as Prisma.QueryMode,
      };
      where.OR = [
        { nameCn: keywordFilter },
        { nameEn: keywordFilter },
        { address: keywordFilter },
      ];
    }

    return await this.prisma.hotel.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        merchant: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async create(merchantId: number, dto: CreateHotelDto) {
    return await this.prisma.hotel.create({
      data: {
        merchantId,
        nameCn: dto.nameCn,
        nameEn: dto.nameEn,
        address: dto.address,
        starRating: dto.starRating,
        cityCode: dto.cityCode,
        tags: dto.tags,
        status: 0,
      },
    });
  }

  async findMine(merchantId: number) {
    return await this.prisma.hotel.findMany({
      where: { merchantId },
      orderBy: { id: 'desc' },
    });
  }

  async findByIdForUser(userId: number, role: string, hotelId: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');

    // admin 可看任意；merchant 只能看自己的
    if (role !== 'ADMIN' && hotel.merchantId !== userId) {
      throw new ForbiddenException('no permission');
    }
    return hotel;
  }

  async update(merchantId: number, hotelId: number, dto: UpdateHotelDto) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        nameCn: dto.nameCn,
        nameEn: dto.nameEn,
        address: dto.address,
        starRating: dto.starRating,
        cityCode: dto.cityCode,
        tags: dto.tags,
      },
    });
  }

  async remove(merchantId: number, hotelId: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');

    return this.prisma.hotel.delete({ where: { id: hotelId } });
  }

  async createForMerchant(merchantId: number, dto: CreateHotelWithRoomsDto) {
    const rooms = dto.rooms ?? [];

    // 事务：hotel + rooms 一起写
    return this.prisma.$transaction(async (tx) => {
      const hotel = await tx.hotel.create({
        data: {
          merchantId,
          nameCn: dto.nameCn,
          nameEn: dto.nameEn,
          address: dto.address,
          starRating: dto.starRating,
          openingDate: dto.openingDate as any, // 如果你 DTO 是 string，后面我建议统一转换
          tags: dto.tags,
          cityCode: dto.cityCode,
          status: 0,
          // imageUrl/latitude/longitude 若在 DTO 里有也可写入
        },
      });

      if (rooms.length > 0) {
        // 注意：你 Room DTO 里 price/originalPrice 是 string（Decimal），这里直接写即可
        await tx.room.createMany({
          data: rooms.map((r) => ({
            hotelId: hotel.id,
            roomName: r.roomName,
            price: r.price as any,
            originalPrice: r.originalPrice as any,
            stock: r.stock,
          })),
        });
      }
      return tx.hotel.findUnique({
        where: { id: hotel.id },
        include: { rooms: true },
      });
    });
  }
  async updateForMerchant(
    merchantId: number,
    hotelId: number,
    dto: UpdateHotelDto,
  ) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        nameCn: dto.nameCn,
        nameEn: dto.nameEn,
        address: dto.address,
        starRating: dto.starRating,
        openingDate: (dto as any).openingDate,
        tags: dto.tags,
        cityCode: dto.cityCode,
      },
    });
  }
  async listMine(merchantId: number) {
    return await this.prisma.hotel.findMany({
      where: { merchantId },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        nameCn: true,
        cityCode: true,
        status: true,
        auditReason: true,
        openingDate: true,
        // 你也可以加 roomsCount：后续可用 _count
      },
    });
  }

  async approveHotel(hotelId: number) {
    return this.updateHotelStatus(hotelId, {
      status: 1,
      auditReason: null,
    });
  }

  async rejectHotel(hotelId: number, auditReason: string) {
    return this.updateHotelStatus(hotelId, {
      status: 2,
      auditReason,
    });
  }

  async offlineHotel(hotelId: number) {
    return this.updateHotelStatus(hotelId, {
      status: 3,
    });
  }

  async restoreHotel(hotelId: number) {
    return this.updateHotelStatus(hotelId, {
      status: 1,
      auditReason: null,
    });
  }

  private async updateHotelStatus(
    hotelId: number,
    data: { status: number; auditReason?: string | null },
  ) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data,
      select: {
        id: true,
        status: true,
        auditReason: true,
        merchantId: true,
      },
    });
  }
}
