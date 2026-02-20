/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Prisma, Room } from '@prisma/client';
import { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { ROOM_IMAGE_URL_PREFIX } from '../hotels/hotel-media.config';
import { RoomDetailDto } from './dto/room-response.dto';
import { RoomDetailQueryDto } from './dto/room-detail-query.dto';
import * as path from 'path';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  // 创建房型前先校验：hotel 是否属于当前 merchant
  async create(
    merchantId: number,
    hotelId: number,
    dto: CreateRoomDto,
    file?: Express.Multer.File,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const hotel = await tx.hotel.findUnique({
        where: { id: hotelId },
      });
      if (!hotel) throw new NotFoundException('hotel not found');
      if (hotel.merchantId !== merchantId)
        throw new ForbiddenException('no permission');

      const pictureUrl = this.resolveRoomImageUrl(file) ?? dto.pictureUrl;
      if (!pictureUrl) throw new BadRequestException('room image is required');

      const room = await tx.room.create({
        data: {
          hotelId,
          name: dto.name,
          areaTitle: dto.areaTitle,
          bedTitle: dto.bedTitle,
          windowTitle: dto.windowTitle,
          floorTitle: dto.floorTitle,
          smokeTitle: dto.smokeTitle,
          wifiInfo: dto.wifiInfo,
          pictureUrl,
          cleaningFacilities: dto.cleaningFacilities ?? undefined,
          bathingFacilities: dto.bathingFacilities ?? undefined,
          layoutFacilities: dto.layoutFacilities ?? undefined,
          accessibleFacilities: dto.accessibleFacilities ?? undefined,
          networkFacilities: dto.networkFacilities ?? undefined,
          bathroomFacilities: dto.bathroomFacilities ?? undefined,
          foodFacilities: dto.foodFacilities ?? undefined,
          childFacilities: dto.childFacilities ?? undefined,
          mediaFacilities: dto.mediaFacilities ?? undefined,
          roomSpecFacilities: dto.roomSpecFacilities ?? undefined,
          kitchenFacilities: dto.kitchenFacilities ?? undefined,
          amenityFacilities: dto.amenityFacilities ?? undefined,
          viewFacilities: dto.viewFacilities ?? undefined,
          capacity: dto.capacity ?? 2,
          price: dto.price,
          totalStock: dto.totalStock,
        },
      });

      await this.seedRoomInventory(tx, room.id, room.totalStock, room.price);

      return room;
    });
  }

  async listByHotel(userId: number, role: string, hotelId: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (role !== 'ADMIN' && hotel.merchantId !== userId)
      throw new ForbiddenException('no permission');

    return this.prisma.room.findMany({
      where: { hotelId },
      orderBy: { id: 'desc' },
    });
  }

  async getRoomDetail(roomId: number, dto: RoomDetailQueryDto) {
    const { checkInDate, checkOutDate } = this.ensureValidDateRange(
      dto.checkIn,
      dto.checkOut,
    );

    const room = await this.prisma.room.findFirst({
      where: { id: roomId },
      select: {
        id: true,
        hotelId: true,
        name: true,
        areaTitle: true,
        bedTitle: true,
        windowTitle: true,
        floorTitle: true,
        smokeTitle: true,
        wifiInfo: true,
        pictureUrl: true,
        cleaningFacilities: true,
        bathingFacilities: true,
        layoutFacilities: true,
        accessibleFacilities: true,
        networkFacilities: true,
        bathroomFacilities: true,
        foodFacilities: true,
        childFacilities: true,
        mediaFacilities: true,
        roomSpecFacilities: true,
        kitchenFacilities: true,
        amenityFacilities: true,
        viewFacilities: true,
        capacity: true,
        price: true,
      },
    });

    if (!room) throw new NotFoundException('room not found');

    const availability = await this.prisma.roomInventory.aggregate({
      where: {
        roomId,
        date: {
          gte: checkInDate,
          lt: checkOutDate,
        },
      },
      _min: {
        availableCount: true,
      },
    });

    return new RoomDetailDto({
      id: room.id,
      hotelId: room.hotelId,
      name: room.name,
      areaTitle: room.areaTitle,
      bedTitle: room.bedTitle,
      windowTitle: room.windowTitle,
      floorTitle: room.floorTitle,
      smokeTitle: room.smokeTitle,
      wifiInfo: room.wifiInfo,
      pictureUrl: room.pictureUrl,
      price: Number(room.price),
      availableCount: availability._min.availableCount ?? 0,
      cleaningFacilities: this.normalizeJson(room.cleaningFacilities),
      bathingFacilities: this.normalizeJson(room.bathingFacilities),
      layoutFacilities: this.normalizeJson(room.layoutFacilities),
      accessibleFacilities: this.normalizeJson(room.accessibleFacilities),
      networkFacilities: this.normalizeJson(room.networkFacilities),
      bathroomFacilities: this.normalizeJson(room.bathroomFacilities),
      foodFacilities: this.normalizeJson(room.foodFacilities),
      childFacilities: this.normalizeJson(room.childFacilities),
      mediaFacilities: this.normalizeJson(room.mediaFacilities),
      roomSpecFacilities: this.normalizeJson(room.roomSpecFacilities),
      kitchenFacilities: this.normalizeJson(room.kitchenFacilities),
      amenityFacilities: this.normalizeJson(room.amenityFacilities),
      viewFacilities: this.normalizeJson(room.viewFacilities),
      capacity: room.capacity,
    });
  }

  async update(
    merchantId: number,
    roomId: number,
    dto: UpdateRoomDto,
    file?: Express.Multer.File,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({ where: { id: roomId } });
      if (!room) throw new NotFoundException('room not found');

      const hotel = await tx.hotel.findUnique({
        where: { id: room.hotelId },
      });
      if (!hotel) throw new NotFoundException('hotel not found');
      if (hotel.merchantId !== merchantId)
        throw new ForbiddenException('no permission');

      const nextPictureUrl =
        this.resolveRoomImageUrl(file) ?? dto.pictureUrl ?? undefined;

      const updated = await tx.room.update({
        where: { id: roomId },
        data: {
          name: dto.name,
          areaTitle: dto.areaTitle,
          bedTitle: dto.bedTitle,
          windowTitle: dto.windowTitle,
          floorTitle: dto.floorTitle,
          smokeTitle: dto.smokeTitle,
          wifiInfo: dto.wifiInfo,
          pictureUrl: nextPictureUrl,
          cleaningFacilities: dto.cleaningFacilities ?? undefined,
          bathingFacilities: dto.bathingFacilities ?? undefined,
          layoutFacilities: dto.layoutFacilities ?? undefined,
          accessibleFacilities: dto.accessibleFacilities ?? undefined,
          networkFacilities: dto.networkFacilities ?? undefined,
          bathroomFacilities: dto.bathroomFacilities ?? undefined,
          foodFacilities: dto.foodFacilities ?? undefined,
          childFacilities: dto.childFacilities ?? undefined,
          mediaFacilities: dto.mediaFacilities ?? undefined,
          roomSpecFacilities: dto.roomSpecFacilities ?? undefined,
          kitchenFacilities: dto.kitchenFacilities ?? undefined,
          amenityFacilities: dto.amenityFacilities ?? undefined,
          viewFacilities: dto.viewFacilities ?? undefined,
          capacity: dto.capacity,
          price: dto.price,
          totalStock: dto.totalStock,
        },
      });

      const today = this.startOfToday();

      if (typeof dto.totalStock === 'number') {
        await tx.roomInventory.updateMany({
          where: {
            roomId,
            date: { gte: today },
          },
          data: {
            availableCount: dto.totalStock,
          },
        });
      }

      if (typeof dto.price !== 'undefined') {
        await tx.roomInventory.updateMany({
          where: {
            roomId,
            date: { gte: today },
          },
          data: {
            price: dto.price,
          },
        });
      }

      return updated;
    });
  }

  async remove(merchantId: number, roomId: number) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('room not found');

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: room.hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');

    return this.prisma.room.delete({ where: { id: roomId } });
  }

  private async seedRoomInventory(
    tx: Prisma.TransactionClient,
    roomId: number,
    totalStock: number,
    price: Prisma.Decimal | string,
  ) {
    const data = this.buildInventoryRows(roomId, totalStock, price);
    if (data.length === 0) return;
    await tx.roomInventory.createMany({
      data,
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

  private startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
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

  private resolveRoomImageUrl(file?: Express.Multer.File) {
    if (!file?.filename) return undefined;
    return path.posix.join(ROOM_IMAGE_URL_PREFIX, file.filename);
  }

  async search(dto: SearchRoomsDto) {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 15;
    const availableRoomIds = await this.resolveAvailableRoomIds(dto);
    const useRaw = process.env.USE_RAW_JSON_FILTER === 'true';
    if (useRaw) {
      return this.searchRoomsRaw(dto, page, pageSize, availableRoomIds);
    }
    return this.searchRoomsPrisma(dto, page, pageSize, availableRoomIds);
  }

  private async searchRoomsPrisma(
    dto: SearchRoomsDto,
    page: number,
    pageSize: number,
    availableRoomIds: number[] | null,
  ) {
    const and: Prisma.RoomWhereInput[] = [{ hotelId: dto.hotelId }];
    if (availableRoomIds) {
      if (availableRoomIds.length === 0) {
        return { total: 0, data: [] };
      }
      and.push({ id: { in: availableRoomIds } });
    }
    const tags = dto.tags;
    if (tags?.areaTitles?.length) {
      and.push({ areaTitle: { in: tags.areaTitles } });
    }
    if (tags?.bedTitles?.length) {
      and.push({ bedTitle: { in: tags.bedTitles } });
    }
    if (tags?.window) {
      and.push({ windowTitle: tags.window });
    }
    if (tags?.smoke) {
      and.push({ smokeTitle: tags.smoke });
    }
    if (tags?.wifi) {
      and.push({ wifiInfo: tags.wifi });
    }

    const facilities = dto.facilities ?? {};
    const addFacility = (
      field: keyof Prisma.RoomWhereInput,
      values?: string[],
    ) => {
      if (values?.length) {
        and.push({
          [field]: {
            hasEvery: values,
          },
        } as Prisma.RoomWhereInput);
      }
    };

    addFacility('cleaningFacilities', facilities.cleaningFacilities);
    addFacility('bathingFacilities', facilities.bathingFacilities);
    addFacility('layoutFacilities', facilities.layoutFacilities);
    addFacility('accessibleFacilities', facilities.accessibleFacilities);
    addFacility('networkFacilities', facilities.networkFacilities);
    addFacility('bathroomFacilities', facilities.bathroomFacilities);
    addFacility('foodFacilities', facilities.foodFacilities);
    addFacility('childFacilities', facilities.childFacilities);
    addFacility('mediaFacilities', facilities.mediaFacilities);
    addFacility('roomSpecFacilities', facilities.roomSpecFacilities);
    addFacility('kitchenFacilities', facilities.kitchenFacilities);
    addFacility('amenityFacilities', facilities.amenityFacilities);
    addFacility('viewFacilities', facilities.viewFacilities);

    const where: Prisma.RoomWhereInput = { AND: and };
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [total, rooms] = await Promise.all([
      this.prisma.room.count({ where }),
      this.prisma.room.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      total,
      data: rooms.map((room) => this.mapRoomEntity(room)),
    };
  }

  private async searchRoomsRaw(
    dto: SearchRoomsDto,
    page: number,
    pageSize: number,
    availableRoomIds: number[] | null,
  ) {
    const filters: Prisma.Sql[] = [Prisma.sql`r.hotel_id = ${dto.hotelId}`];
    if (availableRoomIds) {
      if (availableRoomIds.length === 0) {
        return { total: 0, data: [] };
      }
      filters.push(
        Prisma.sql`r.id IN (${Prisma.join(
          availableRoomIds.map((id) => Prisma.sql`${id}`),
          ',',
        )})`,
      );
    }
    const tags = dto.tags;
    if (tags?.areaTitles?.length) {
      filters.push(
        Prisma.sql`r.area_title IN (${Prisma.join(
          tags.areaTitles.map((v) => Prisma.sql`${v}`),
          //Prisma.sql`,`,
          ',',
        )})`,
      );
    }
    if (tags?.bedTitles?.length) {
      filters.push(
        Prisma.sql`r.bed_title IN (${Prisma.join(
          tags.bedTitles.map((v) => Prisma.sql`${v}`),
          //Prisma.sql`,`,
          ',',
        )})`,
      );
    }
    if (tags?.window) {
      filters.push(Prisma.sql`r.window_title = ${tags.window}`);
    }
    if (tags?.smoke) {
      filters.push(Prisma.sql`r.smoke_title = ${tags.smoke}`);
    }
    if (tags?.wifi) {
      filters.push(Prisma.sql`r.wifi_info = ${tags.wifi}`);
    }

    const facilities = dto.facilities ?? {};
    const addFacilityFilter = (column: string, values?: string[]) => {
      if (values?.length) {
        for (const value of values) {
          filters.push(
            Prisma.sql`JSON_CONTAINS(COALESCE(r.${Prisma.raw(
              column,
            )}, JSON_ARRAY()), JSON_QUOTE(${value}))`,
          );
        }
      }
    };

    addFacilityFilter('cleaning_facilities', facilities.cleaningFacilities);
    addFacilityFilter('bathing_facilities', facilities.bathingFacilities);
    addFacilityFilter('layout_facilities', facilities.layoutFacilities);
    addFacilityFilter('accessible_facilities', facilities.accessibleFacilities);
    addFacilityFilter('network_facilities', facilities.networkFacilities);
    addFacilityFilter('bathroom_facilities', facilities.bathroomFacilities);
    addFacilityFilter('food_facilities', facilities.foodFacilities);
    addFacilityFilter('child_facilities', facilities.childFacilities);
    addFacilityFilter('media_facilities', facilities.mediaFacilities);
    addFacilityFilter('room_spec_facilities', facilities.roomSpecFacilities);
    addFacilityFilter('kitchen_facilities', facilities.kitchenFacilities);
    addFacilityFilter('amenity_facilities', facilities.amenityFacilities);
    addFacilityFilter('view_facilities', facilities.viewFacilities);

    const whereClause = filters.length
      ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
      : Prisma.empty;

    const skip = (page - 1) * pageSize;
    const dataQuery = Prisma.sql`
      SELECT *
      FROM room r
      ${whereClause}
      ORDER BY r.id DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    const countQuery = Prisma.sql`
      SELECT COUNT(1) AS total
      FROM room r
      ${whereClause}
    `;

    const [rows, countRows] = await Promise.all([
      this.prisma.$queryRaw<RoomRaw[]>(dataQuery),
      this.prisma.$queryRaw<{ total: number }[]>(countQuery),
    ]);

    const total = countRows[0]?.total ?? 0;
    return {
      total,
      data: rows.map((row) => this.mapRoomRaw(row)),
    };
  }

  private async resolveAvailableRoomIds(dto: SearchRoomsDto) {
    const { checkIn, checkOut, roomsNeeded, peopleNeeded } = dto;
    const hasAnyAvailabilityFilter =
      Boolean(checkIn) ||
      Boolean(checkOut) ||
      typeof roomsNeeded === 'number' ||
      typeof peopleNeeded === 'number';

    if (!hasAnyAvailabilityFilter) {
      return null;
    }

    if (
      !checkIn ||
      !checkOut ||
      typeof roomsNeeded !== 'number' ||
      typeof peopleNeeded !== 'number'
    ) {
      throw new BadRequestException(
        'checkIn, checkOut, roomsNeeded and peopleNeeded must be provided together',
      );
    }

    const { checkInDate, checkOutDate } = this.ensureValidDateRange(
      checkIn,
      checkOut,
    );
    const minCapacity = Math.ceil(peopleNeeded / roomsNeeded);

    const candidateRooms = await this.prisma.room.findMany({
      where: {
        hotelId: dto.hotelId,
        capacity: { gte: minCapacity },
      },
      select: { id: true },
    });

    const candidateRoomIds = candidateRooms.map((room) => room.id);
    if (candidateRoomIds.length === 0) return [];

    const availabilityRows = await this.prisma.roomInventory.groupBy({
      by: ['roomId'],
      where: {
        roomId: { in: candidateRoomIds },
        date: {
          gte: checkInDate,
          lt: checkOutDate,
        },
      },
      _min: {
        availableCount: true,
      },
    });

    return availabilityRows
      .filter((row) => (row._min.availableCount ?? 0) >= roomsNeeded)
      .map((row) => row.roomId);
  }

  private mapRoomEntity(room: Room) {
    const {
      totalStock,
      price,
      cleaningFacilities,
      bathingFacilities,
      layoutFacilities,
      accessibleFacilities,
      networkFacilities,
      bathroomFacilities,
      foodFacilities,
      childFacilities,
      mediaFacilities,
      roomSpecFacilities,
      kitchenFacilities,
      amenityFacilities,
      viewFacilities,
      ...rest
    } = room;
    const priceNumber = Number(price);
    return {
      ...rest,
      price: priceNumber,
      priceOriginal: priceNumber,
      priceDiscounted: priceNumber,
      cleaningFacilities: this.normalizeJson(cleaningFacilities),
      bathingFacilities: this.normalizeJson(bathingFacilities),
      layoutFacilities: this.normalizeJson(layoutFacilities),
      accessibleFacilities: this.normalizeJson(accessibleFacilities),
      networkFacilities: this.normalizeJson(networkFacilities),
      bathroomFacilities: this.normalizeJson(bathroomFacilities),
      foodFacilities: this.normalizeJson(foodFacilities),
      childFacilities: this.normalizeJson(childFacilities),
      mediaFacilities: this.normalizeJson(mediaFacilities),
      roomSpecFacilities: this.normalizeJson(roomSpecFacilities),
      kitchenFacilities: this.normalizeJson(kitchenFacilities),
      amenityFacilities: this.normalizeJson(amenityFacilities),
      viewFacilities: this.normalizeJson(viewFacilities),
    };
  }

  private mapRoomRaw(row: RoomRaw) {
    const priceNumber = Number(row.price);
    return {
      id: row.id,
      hotelId: row.hotel_id,
      name: row.name,
      areaTitle: row.area_title,
      bedTitle: row.bed_title,
      windowTitle: row.window_title,
      floorTitle: row.floor_title,
      smokeTitle: row.smoke_title,
      wifiInfo: row.wifi_info,
      pictureUrl: row.picture_url,
      cleaningFacilities: this.normalizeJson(row.cleaning_facilities),
      bathingFacilities: this.normalizeJson(row.bathing_facilities),
      layoutFacilities: this.normalizeJson(row.layout_facilities),
      accessibleFacilities: this.normalizeJson(row.accessible_facilities),
      networkFacilities: this.normalizeJson(row.network_facilities),
      bathroomFacilities: this.normalizeJson(row.bathroom_facilities),
      foodFacilities: this.normalizeJson(row.food_facilities),
      childFacilities: this.normalizeJson(row.child_facilities),
      mediaFacilities: this.normalizeJson(row.media_facilities),
      roomSpecFacilities: this.normalizeJson(row.room_spec_facilities),
      kitchenFacilities: this.normalizeJson(row.kitchen_facilities),
      amenityFacilities: this.normalizeJson(row.amenity_facilities),
      viewFacilities: this.normalizeJson(row.view_facilities),
      capacity: row.capacity,
      price: priceNumber,
      priceOriginal: priceNumber,
      priceDiscounted: priceNumber,
    };
  }

  private normalizeJson(value: unknown): string[] {
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
}

type RoomRaw = {
  id: number;
  hotel_id: number;
  name: string;
  area_title: string;
  bed_title: string;
  window_title: string;
  floor_title: string;
  smoke_title: string;
  wifi_info: string | null;
  picture_url: string;
  cleaning_facilities: string | null;
  bathing_facilities: string | null;
  layout_facilities: string | null;
  accessible_facilities: string | null;
  network_facilities: string | null;
  bathroom_facilities: string | null;
  food_facilities: string | null;
  child_facilities: string | null;
  media_facilities: string | null;
  room_spec_facilities: string | null;
  kitchen_facilities: string | null;
  amenity_facilities: string | null;
  view_facilities: string | null;
  capacity: number;
  price: Prisma.Decimal;
  total_stock: number;
};
