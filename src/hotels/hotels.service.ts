/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PromotionType } from '@prisma/client';
import { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateHotelWithRoomsDto } from './dto/create-hotel-with-rooms.dto';
import { HotelSearchSort, SearchHotelsDto } from './dto/search-hotels.dto';
import { HOTEL_IMAGE_URL_PREFIX } from './hotel-media.config';
import {
  HotelDetailDto,
  HotelListItemDto,
  HotelPromotionDto,
} from './dto/hotel-response.dto';
import { HotelDetailQueryDto } from './dto/hotel-detail-query.dto';
import { RoomListItemDto } from '../rooms/dto/room-response.dto';
import { CreateHotelPromotionDto } from './dto/create-hotel-promotion.dto';
import { UpdateHotelPromotionDto } from './dto/update-hotel-promotion.dto';
import * as path from 'path';

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

  async search(dto: SearchHotelsDto) {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;
    const hasLocation =
      typeof dto.userLat === 'number' && typeof dto.userLng === 'number';
    const distanceSelect = hasLocation
      ? Prisma.sql`
        (6371000 * acos(least(1,
          cos(radians(${dto.userLat})) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(${dto.userLng}))
          + sin(radians(${dto.userLat})) * sin(radians(h.latitude))
        ))) AS distance`
      : Prisma.sql`NULL AS distance`;

    const conditions = this.buildHotelSearchConditions(dto);
    const roomExists = this.buildRoomSearchExistsClause(dto);
    if (roomExists) conditions.push(roomExists);
    const availabilityClause = this.buildAvailabilityClause(dto);
    if (availabilityClause) conditions.push(availabilityClause);
    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;
    const sortClause = this.buildSearchOrderClause(dto.sortBy, hasLocation);
    const skip = (page - 1) * pageSize;

    const dataQuery = Prisma.sql`
      SELECT
        h.id,
        h.merchant_id,
        h.name_cn,
        h.name_en,
        h.image_urls,
        h.star_rating,
        h.score,
        h.total_reviews,
        h.price,
        h.cross_line_price,
        h.currency,
        h.short_tags,
        h.latitude,
        h.longitude,
        h.address,
        h.city_code,
        h.opening_date,
        h.status,
        ${distanceSelect}
      FROM hotel h
      ${whereClause}
      ${sortClause}
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    const countQuery = Prisma.sql`
      SELECT COUNT(1) AS total
      FROM hotel h
      ${whereClause}
    `;

    const [rows, countRows] = await Promise.all([
      this.prisma.$queryRaw<HotelSearchRaw[]>(dataQuery),
      this.prisma.$queryRaw<{ total: number }[]>(countQuery),
    ]);

    const rawTotal = countRows[0]?.total ?? 0;
    const total =
      typeof rawTotal === 'bigint' ? Number(rawTotal) : Number(rawTotal);
    return {
      total,
      data: rows.map((row) => this.mapHotelSearchRow(row)),
    };
  }

  async getHotelDetail(hotelId: number, dto: HotelDetailQueryDto) {
    const { checkInDate, checkOutDate } = this.ensureValidDateRange(
      dto.checkIn,
      dto.checkOut,
    );

    const hotel = await this.prisma.hotel.findFirst({
      where: { id: hotelId, status: 1 },
      select: {
        id: true,
        merchantId: true,
        nameCn: true,
        nameEn: true,
        imageUrls: true,
        starRating: true,
        score: true,
        totalReviews: true,
        price: true,
        crossLinePrice: true,
        currency: true,
        shortTags: true,
        address: true,
        openingDate: true,
        cityCode: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!hotel) {
      throw new NotFoundException('hotel not found or unavailable');
    }

    const rooms = await this.prisma.room.findMany({
      where: { hotelId },
      select: {
        id: true,
        hotelId: true,
        name: true,
        areaTitle: true,
        bedTitle: true,
        windowTitle: true,
        smokeTitle: true,
        wifiInfo: true,
        pictureUrl: true,
        price: true,
        capacity: true,
      },
      orderBy: { price: 'asc' },
    });

    const roomIds = rooms.map((room) => room.id);
    const availabilityMap = new Map<number, number>();
    if (roomIds.length > 0) {
      const availability = await this.prisma.roomInventory.groupBy({
        by: ['roomId'],
        where: {
          roomId: { in: roomIds },
          date: {
            gte: checkInDate,
            lt: checkOutDate,
          },
        },
        _min: {
          availableCount: true,
        },
      });
      for (const row of availability) {
        availabilityMap.set(row.roomId, row._min.availableCount ?? 0);
      }
    }

    const promotions = await this.prisma.hotelPromotion.findMany({
      where: {
        hotelId,
        startDate: { lte: checkOutDate },
        endDate: { gte: checkInDate },
      },
      orderBy: { startDate: 'asc' },
    });
    const promotionDtos = promotions.map(
      (promotion) =>
        new HotelPromotionDto({
          id: promotion.id,
          promotionType: promotion.promotionType,
          discount: Number(promotion.discount),
          startDate: promotion.startDate,
          endDate: promotion.endDate,
        }),
    );
    let bestDiscount = new Prisma.Decimal(1);
    if (promotions.length > 0) {
      bestDiscount = promotions.reduce(
        (min, promo) => (promo.discount.lt(min) ? promo.discount : min),
        promotions[0].discount,
      );
    }

    const roomDtos = rooms.map(
      (room) =>
        new RoomListItemDto({
          id: room.id,
          hotelId: room.hotelId,
          name: room.name,
          areaTitle: room.areaTitle,
          bedTitle: room.bedTitle,
          windowTitle: room.windowTitle,
          smokeTitle: room.smokeTitle,
          wifiInfo: room.wifiInfo,
          pictureUrl: room.pictureUrl,
          priceOriginal: Number(room.price),
          priceDiscounted: Number(room.price.mul(bestDiscount)),
          price: Number(room.price.mul(bestDiscount)),
          availableCount: availabilityMap.get(room.id) ?? 0,
        }),
    );

    return new HotelDetailDto({
      id: hotel.id,
      merchantId: hotel.merchantId,
      nameCn: hotel.nameCn,
      nameEn: hotel.nameEn,
      imageUrls: this.ensureStringArray(hotel.imageUrls),
      starRating: hotel.starRating,
      score: hotel.score ? Number(hotel.score) : 0,
      totalReviews: hotel.totalReviews,
      price: Number(hotel.price),
      crossLinePrice: hotel.crossLinePrice
        ? Number(hotel.crossLinePrice)
        : null,
      currency: hotel.currency,
      shortTags: this.ensureStringArray(hotel.shortTags),
      address: hotel.address,
      cityCode: hotel.cityCode,
      openingDate: hotel.openingDate,
      latitude: hotel.latitude ? Number(hotel.latitude) : undefined,
      longitude: hotel.longitude ? Number(hotel.longitude) : undefined,
      promotions: promotionDtos,
      rooms: roomDtos,
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
        openingDate: dto.openingDate as any,
        cityCode: dto.cityCode,
        status: 0,
        imageUrls: dto.imageUrls ?? [],
        score:
          typeof dto.score === 'number'
            ? new Prisma.Decimal(dto.score)
            : undefined,
        totalReviews: dto.totalReviews,
        price: new Prisma.Decimal(dto.price),
        crossLinePrice: dto.crossLinePrice
          ? new Prisma.Decimal(dto.crossLinePrice)
          : undefined,
        currency: dto.currency ?? 'RMB',
        shortTags: dto.shortTags ?? [],
        latitude: new Prisma.Decimal(dto.latitude),
        longitude: new Prisma.Decimal(dto.longitude),
      },
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

  async findMine(merchantId: number) {
    return await this.prisma.hotel.findMany({
      where: { merchantId },
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
        openingDate: dto.openingDate as any,
        cityCode: dto.cityCode,
        imageUrls: dto.imageUrls ?? undefined,
        score:
          typeof dto.score === 'number'
            ? new Prisma.Decimal(dto.score)
            : undefined,
        totalReviews: dto.totalReviews,
        price: dto.price ? new Prisma.Decimal(dto.price) : undefined,
        crossLinePrice: dto.crossLinePrice
          ? new Prisma.Decimal(dto.crossLinePrice)
          : undefined,
        currency: dto.currency,
        shortTags: dto.shortTags ?? undefined,
        latitude:
          typeof dto.latitude === 'number'
            ? new Prisma.Decimal(dto.latitude)
            : undefined,
        longitude:
          typeof dto.longitude === 'number'
            ? new Prisma.Decimal(dto.longitude)
            : undefined,
      },
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

  async remove(merchantId: number, hotelId: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: { status: 3 },
    });
  }

  async createForMerchant(
    merchantId: number,
    dto: CreateHotelWithRoomsDto,
    files?: Express.Multer.File[],
  ) {
    const rooms = dto.rooms ?? [];
    const uploadedImageUrls = this.extractImageUrls(files);
    const finalImageUrls =
      uploadedImageUrls.length > 0 ? uploadedImageUrls : (dto.imageUrls ?? []);

    // 事务：hotel + rooms 一起写
    return this.prisma.$transaction(async (tx) => {
      const hotel = await tx.hotel.create({
        data: {
          merchantId,
          nameCn: dto.nameCn,
          nameEn: dto.nameEn,
          address: dto.address,
          starRating: dto.starRating,
          openingDate: dto.openingDate as any,
          cityCode: dto.cityCode,
          status: 0,
          imageUrls: finalImageUrls,
          score:
            typeof dto.score === 'number'
              ? new Prisma.Decimal(dto.score)
              : undefined,
          totalReviews: dto.totalReviews,
          price: new Prisma.Decimal(dto.price),
          crossLinePrice: dto.crossLinePrice
            ? new Prisma.Decimal(dto.crossLinePrice)
            : undefined,
          currency: dto.currency ?? 'RMB',
          shortTags: dto.shortTags ?? [],
          latitude: new Prisma.Decimal(dto.latitude),
          longitude: new Prisma.Decimal(dto.longitude),
        },
      });

      if (rooms.length > 0) {
        for (const roomDto of rooms) {
          const room = await tx.room.create({
            data: {
              hotelId: hotel.id,
              name: roomDto.name,
              areaTitle: roomDto.areaTitle,
              bedTitle: roomDto.bedTitle,
              windowTitle: roomDto.windowTitle,
              floorTitle: roomDto.floorTitle,
              smokeTitle: roomDto.smokeTitle,
              wifiInfo: roomDto.wifiInfo,
              pictureUrl: roomDto.pictureUrl,
              cleaningFacilities: roomDto.cleaningFacilities ?? undefined,
              bathingFacilities: roomDto.bathingFacilities ?? undefined,
              layoutFacilities: roomDto.layoutFacilities ?? undefined,
              accessibleFacilities: roomDto.accessibleFacilities ?? undefined,
              networkFacilities: roomDto.networkFacilities ?? undefined,
              bathroomFacilities: roomDto.bathroomFacilities ?? undefined,
              foodFacilities: roomDto.foodFacilities ?? undefined,
              childFacilities: roomDto.childFacilities ?? undefined,
              mediaFacilities: roomDto.mediaFacilities ?? undefined,
              roomSpecFacilities: roomDto.roomSpecFacilities ?? undefined,
              kitchenFacilities: roomDto.kitchenFacilities ?? undefined,
              amenityFacilities: roomDto.amenityFacilities ?? undefined,
              viewFacilities: roomDto.viewFacilities ?? undefined,
              capacity: roomDto.capacity ?? 2,
              price: roomDto.price as any,
              totalStock: roomDto.totalStock,
            },
          });
          await this.seedRoomInventory(
            tx,
            room.id,
            room.totalStock,
            room.price,
          );
        }
      }
      return tx.hotel.findUnique({
        where: { id: hotel.id },
        include: {
          rooms: true,
          merchant: {
            select: {
              id: true,
              username: true,
            },
          },
        },
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
        openingDate: dto.openingDate as any,
        cityCode: dto.cityCode,
        imageUrls: dto.imageUrls ?? undefined,
        score:
          typeof dto.score === 'number'
            ? new Prisma.Decimal(dto.score)
            : undefined,
        totalReviews: dto.totalReviews,
        price: dto.price ? new Prisma.Decimal(dto.price) : undefined,
        crossLinePrice: dto.crossLinePrice
          ? new Prisma.Decimal(dto.crossLinePrice)
          : undefined,
        currency: dto.currency,
        shortTags: dto.shortTags ?? undefined,
        latitude:
          typeof dto.latitude === 'number'
            ? new Prisma.Decimal(dto.latitude)
            : undefined,
        longitude:
          typeof dto.longitude === 'number'
            ? new Prisma.Decimal(dto.longitude)
            : undefined,
      },
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
  async listMine(merchantId: number) {
    return await this.prisma.hotel.findMany({
      where: { merchantId },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        merchantId: true,
        nameCn: true,
        address: true,
        starRating: true,
        cityCode: true,
        status: true,
        auditReason: true,
        openingDate: true,
        price: true,
        crossLinePrice: true,
        currency: true,
        score: true,
        totalReviews: true,
        imageUrls: true,
        latitude: true,
        longitude: true,
        shortTags: true,
        merchant: {
          select: {
            id: true,
            username: true,
          },
        },
        // 你也可以加 roomsCount：后续可用 _count
      },
    });
  }

  async listHotelsByPromotion(type: PromotionType) {
    const now = new Date();
    const hotels = await this.prisma.hotel.findMany({
      where: {
        status: 1,
        promotions: {
          some: {
            promotionType: type,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        },
      },
      orderBy: { id: 'desc' },
      include: {
        promotions: {
          where: {
            promotionType: type,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    return hotels.map(
      (hotel) =>
        new HotelListItemDto({
          id: hotel.id,
          merchantId: hotel.merchantId,
          nameCn: hotel.nameCn,
          nameEn: hotel.nameEn,
          imageUrls: this.ensureStringArray(hotel.imageUrls),
          starRating: hotel.starRating,
          score: hotel.score ? Number(hotel.score) : 0,
          totalReviews: hotel.totalReviews,
          price: Number(hotel.price),
          crossLinePrice: hotel.crossLinePrice
            ? Number(hotel.crossLinePrice)
            : null,
          currency: hotel.currency,
          shortTags: this.ensureStringArray(hotel.shortTags),
          address: hotel.address,
          cityCode: hotel.cityCode,
          openingDate: hotel.openingDate,
          latitude: hotel.latitude ? Number(hotel.latitude) : undefined,
          longitude: hotel.longitude ? Number(hotel.longitude) : undefined,
          promotions: hotel.promotions.map(
            (promotion) =>
              new HotelPromotionDto({
                id: promotion.id,
                promotionType: promotion.promotionType,
                discount: Number(promotion.discount),
                startDate: promotion.startDate,
                endDate: promotion.endDate,
              }),
          ),
        }),
    );
  }

  async listPromotionsForMerchant(merchantId: number, hotelId: number) {
    await this.ensureHotelOwnedByMerchant(merchantId, hotelId);
    return this.prisma.hotelPromotion.findMany({
      where: { hotelId },
      orderBy: { startDate: 'asc' },
    });
  }

  async createPromotionForMerchant(
    merchantId: number,
    hotelId: number,
    dto: CreateHotelPromotionDto,
  ) {
    await this.ensureHotelOwnedByMerchant(merchantId, hotelId);
    const { startDate, endDate } = this.resolvePromotionDates(
      dto.startDate,
      dto.endDate,
    );
    const discount = this.parseDiscount(dto.discount);

    return this.prisma.hotelPromotion.create({
      data: {
        hotelId,
        promotionType: dto.promotionType,
        discount,
        startDate,
        endDate,
      },
    });
  }

  async updatePromotionForMerchant(
    merchantId: number,
    hotelId: number,
    promotionId: number,
    dto: UpdateHotelPromotionDto,
  ) {
    await this.ensureHotelOwnedByMerchant(merchantId, hotelId);
    const promotion = await this.prisma.hotelPromotion.findUnique({
      where: { id: promotionId },
    });
    if (!promotion || promotion.hotelId !== hotelId) {
      throw new NotFoundException('promotion not found');
    }

    const start = dto.startDate
      ? this.parseDate(dto.startDate, 'startDate')
      : promotion.startDate;
    const end = dto.endDate
      ? this.parseDate(dto.endDate, 'endDate')
      : promotion.endDate;
    this.ensureDateOrder(start, end);

    const data: Prisma.HotelPromotionUpdateInput = {};
    if (dto.promotionType) data.promotionType = dto.promotionType;
    if (dto.discount) data.discount = this.parseDiscount(dto.discount);
    data.startDate = start;
    data.endDate = end;

    return this.prisma.hotelPromotion.update({
      where: { id: promotionId },
      data,
    });
  }

  async deletePromotionForMerchant(
    merchantId: number,
    hotelId: number,
    promotionId: number,
  ) {
    await this.ensureHotelOwnedByMerchant(merchantId, hotelId);
    const promotion = await this.prisma.hotelPromotion.findUnique({
      where: { id: promotionId },
    });
    if (!promotion || promotion.hotelId !== hotelId) {
      throw new NotFoundException('promotion not found');
    }
    await this.prisma.hotelPromotion.delete({
      where: { id: promotionId },
    });
    return { deleted: true };
  }

  async approveHotel(hotelId: number) {
    return this.updateHotelStatus(hotelId, {
      status: 1,
      auditReason: null,
    });
  }

  async approveAllPending() {
    const result = await this.prisma.hotel.updateMany({
      where: { status: 0 },
      data: { status: 1, auditReason: null },
    });
    return { updated: result.count };
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

  private async ensureHotelOwnedByMerchant(
    merchantId: number,
    hotelId: number,
  ) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { merchantId: true },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');
  }

  private resolvePromotionDates(startStr: string, endStr: string) {
    const start = this.parseDate(startStr, 'startDate');
    const end = this.parseDate(endStr, 'endDate');
    this.ensureDateOrder(start, end);
    return { startDate: start, endDate: end };
  }

  private parseDate(value: string, field: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} is invalid date`);
    }
    return date;
  }

  private ensureDateOrder(start: Date, end: Date) {
    if (end <= start) {
      throw new BadRequestException('endDate must be after startDate');
    }
  }

  private parseDiscount(value: string) {
    let discount: Prisma.Decimal;
    try {
      discount = new Prisma.Decimal(value);
    } catch {
      throw new BadRequestException('invalid discount');
    }
    if (discount.lte(0) || discount.gt(1)) {
      throw new BadRequestException('discount must be between 0 and 1');
    }
    return discount;
  }

  private buildSearchOrderClause(
    sortBy: HotelSearchSort | undefined,
    hasLocation: boolean,
  ) {
    if ((!sortBy || sortBy === HotelSearchSort.distance) && hasLocation) {
      return Prisma.sql`ORDER BY distance ASC, h.price ASC`;
    }
    if (sortBy === HotelSearchSort.price || !sortBy) {
      return Prisma.sql`ORDER BY h.price ASC`;
    }
    if (sortBy === HotelSearchSort.score) {
      return Prisma.sql`ORDER BY h.score DESC, h.price ASC`;
    }
    return Prisma.sql`ORDER BY h.price ASC`;
  }

  private mapHotelSearchRow(row: HotelSearchRaw) {
    return new HotelListItemDto({
      id: row.id,
      merchantId: row.merchant_id,
      nameCn: row.name_cn,
      nameEn: row.name_en,
      imageUrls: this.parseJsonArray<string>(row.image_urls),
      shortTags: this.parseJsonArray<string>(row.short_tags),
      starRating: row.star_rating,
      score: Number(row.score),
      totalReviews: row.total_reviews,
      price: Number(row.price),
      crossLinePrice: row.cross_line_price
        ? Number(row.cross_line_price)
        : null,
      currency: row.currency,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      address: row.address,
      cityCode: row.city_code,
      openingDate: row.opening_date,
      status: row.status,
      distance: row.distance === null ? null : Number(row.distance),
    });
  }

  private parseJsonArray<T>(value: unknown): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    try {
      const parsed = JSON.parse(value as string);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  private ensureStringArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === 'string')
          : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private ensureValidDateRange(checkIn: string, checkOut: string) {
    if (!checkIn || !checkOut) {
      throw new BadRequestException('checkIn and checkOut are required');
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      throw new BadRequestException('Invalid check-in or check-out date');
    }
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('checkOut must be after checkIn');
    }
    return { checkInDate, checkOutDate };
  }

  private buildAvailabilityClause(dto: SearchHotelsDto) {
    const { checkIn, checkOut, roomsNeeded, peopleNeeded } = dto;
    if (
      !checkIn ||
      !checkOut ||
      typeof roomsNeeded !== 'number' ||
      typeof peopleNeeded !== 'number'
    ) {
      return null;
    }

    const { checkInDate, checkOutDate } = this.ensureValidDateRange(
      checkIn,
      checkOut,
    );

    return Prisma.sql`
      EXISTS (
        SELECT 1
        FROM (
          SELECT
            ranked.hotel_id,
            SUM(
              LEAST(
                ranked.stock_min,
                GREATEST(0, ${roomsNeeded} - (ranked.cum_stock - ranked.stock_min))
              ) * ranked.capacity
            ) AS max_people,
            MAX(ranked.total_stock) AS total_stock
          FROM (
            SELECT
              rs.hotel_id,
              rs.room_id,
              rs.capacity,
              rs.stock_min,
              SUM(rs.stock_min) OVER (
                PARTITION BY rs.hotel_id
                ORDER BY rs.capacity DESC, rs.room_id ASC
              ) AS cum_stock,
              SUM(rs.stock_min) OVER (
                PARTITION BY rs.hotel_id
              ) AS total_stock
            FROM (
              SELECT
                r.hotel_id,
                r.id AS room_id,
                r.capacity,
                MIN(ri.available_count) AS stock_min
              FROM room r
              JOIN room_inventory ri ON ri.room_id = r.id
              WHERE
                ri.date >= ${checkInDate}
                AND ri.date < ${checkOutDate}
              GROUP BY r.hotel_id, r.id, r.capacity
            ) rs
          ) ranked
          GROUP BY ranked.hotel_id
        ) availability
        WHERE
          availability.total_stock >= ${roomsNeeded}
          AND availability.max_people >= ${peopleNeeded}
          AND availability.hotel_id = h.id
      )
    `;
  }

  private buildRoomSearchExistsClause(dto: SearchHotelsDto) {
    const roomFilters = dto.room;
    if (!roomFilters) return null;

    const conditions: Prisma.Sql[] = [Prisma.sql`r.hotel_id = h.id`];
    const tags = roomFilters.tags;

    if (tags?.areaTitles?.length) {
      conditions.push(
        Prisma.sql`r.area_title IN (${Prisma.join(
          tags.areaTitles.map((v) => Prisma.sql`${v}`),
          ',',
        )})`,
      );
    }
    if (tags?.bedTitles?.length) {
      conditions.push(
        Prisma.sql`r.bed_title IN (${Prisma.join(
          tags.bedTitles.map((v) => Prisma.sql`${v}`),
          ',',
        )})`,
      );
    }
    if (tags?.window) {
      conditions.push(Prisma.sql`r.window_title = ${tags.window}`);
    }
    if (tags?.smoke) {
      conditions.push(Prisma.sql`r.smoke_title = ${tags.smoke}`);
    }
    if (tags?.wifi) {
      conditions.push(Prisma.sql`r.wifi_info = ${tags.wifi}`);
    }

    const facilities = roomFilters.facilities ?? {};
    const addFacility = (column: string, values?: string[]) => {
      if (values?.length) {
        for (const value of values) {
          conditions.push(
            Prisma.sql`JSON_CONTAINS(COALESCE(r.${Prisma.raw(
              column,
            )}, JSON_ARRAY()), JSON_QUOTE(${value}))`,
          );
        }
      }
    };

    addFacility('cleaning_facilities', facilities.cleaningFacilities);
    addFacility('bathing_facilities', facilities.bathingFacilities);
    addFacility('layout_facilities', facilities.layoutFacilities);
    addFacility('accessible_facilities', facilities.accessibleFacilities);
    addFacility('network_facilities', facilities.networkFacilities);
    addFacility('bathroom_facilities', facilities.bathroomFacilities);
    addFacility('food_facilities', facilities.foodFacilities);
    addFacility('child_facilities', facilities.childFacilities);
    addFacility('media_facilities', facilities.mediaFacilities);
    addFacility('room_spec_facilities', facilities.roomSpecFacilities);
    addFacility('kitchen_facilities', facilities.kitchenFacilities);
    addFacility('amenity_facilities', facilities.amenityFacilities);
    addFacility('view_facilities', facilities.viewFacilities);

    if (conditions.length === 1) return null;

    return Prisma.sql`EXISTS (
      SELECT 1 FROM room r
      WHERE ${Prisma.join(conditions, ' AND ')}
    )`;
  }

  private async seedRoomInventory(
    tx: Prisma.TransactionClient,
    roomId: number,
    totalStock: number,
    price: Prisma.Decimal | string,
  ) {
    const rows = this.buildInventoryRows(roomId, totalStock, price);
    if (rows.length === 0) return;
    await tx.roomInventory.createMany({
      data: rows,
      skipDuplicates: true,
    });
  }

  private buildInventoryRows(
    roomId: number,
    totalStock: number,
    price: Prisma.Decimal | string,
  ) {
    const start = this.startOfToday();
    const rows: Prisma.RoomInventoryCreateManyInput[] = [];
    for (let offset = 0; offset < 60; offset += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      rows.push({
        roomId,
        date,
        availableCount: totalStock,
        price,
      });
    }
    return rows;
  }

  private buildHotelSearchConditions(dto: SearchHotelsDto) {
    const conditions: Prisma.Sql[] = [Prisma.sql`h.status = 1`];

    if (dto.keyword) {
      conditions.push(
        Prisma.sql`h.name_cn LIKE ${'%' + dto.keyword.trim() + '%'}`,
      );
    }
    if (dto.cityCode) {
      conditions.push(Prisma.sql`h.city_code = ${dto.cityCode}`);
    }
    if (typeof dto.minPrice === 'number') {
      conditions.push(Prisma.sql`h.price >= ${dto.minPrice}`);
    }
    if (typeof dto.maxPrice === 'number') {
      conditions.push(Prisma.sql`h.price <= ${dto.maxPrice}`);
    }
    if (typeof dto.minStar === 'number') {
      conditions.push(Prisma.sql`h.star_rating >= ${dto.minStar}`);
    }
    if (typeof dto.maxStar === 'number') {
      conditions.push(Prisma.sql`h.star_rating <= ${dto.maxStar}`);
    }
    if (typeof dto.minScore === 'number') {
      conditions.push(Prisma.sql`h.score >= ${dto.minScore}`);
    }
    if (dto.tags?.length) {
      for (const tag of dto.tags) {
        conditions.push(
          Prisma.sql`JSON_CONTAINS(COALESCE(h.short_tags, JSON_ARRAY()), JSON_ARRAY(${tag}))`,
        );
      }
    }

    return conditions;
  }

  private startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private extractImageUrls(files?: Express.Multer.File[]) {
    if (!files?.length) return [];
    return files
      .filter((file) => !!file?.filename)
      .map((file) => path.posix.join(HOTEL_IMAGE_URL_PREFIX, file.filename));
  }
}
type HotelSearchRaw = {
  id: number;
  merchant_id: number;
  name_cn: string;
  name_en: string;
  image_urls: string | null;
  short_tags: string | null;
  star_rating: number;
  score: Prisma.Decimal;
  total_reviews: number;
  price: Prisma.Decimal;
  cross_line_price: Prisma.Decimal | null;
  currency: string;
  latitude: Prisma.Decimal;
  longitude: Prisma.Decimal;
  address: string;
  city_code: string;
  opening_date: Date;
  status: number;
  distance: number | null;
};
