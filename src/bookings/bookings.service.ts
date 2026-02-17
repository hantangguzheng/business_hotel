/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    const { checkInDate, checkOutDate } = this.ensureValidDateRange(
      dto.checkIn,
      dto.checkOut,
    );
    const nights = this.diffInDays(checkInDate, checkOutDate);
    if (nights <= 0) {
      throw new BadRequestException('stay must be at least one night');
    }

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: dto.roomId },
      });
      if (!room) throw new NotFoundException('room not found');

      const inventories = await tx.roomInventory.findMany({
        where: {
          roomId: room.id,
          date: { gte: checkInDate, lt: checkOutDate },
        },
        orderBy: { date: 'asc' },
      });
      this.assertInventoryCoverage(inventories, checkInDate, nights);

      for (const inventory of inventories) {
        if (inventory.availableCount < dto.rooms) {
          throw new BadRequestException('inventory not sufficient');
        }
      }

      for (const inventory of inventories) {
        const result = await tx.roomInventory.updateMany({
          where: { id: inventory.id, availableCount: { gte: dto.rooms } },
          data: {
            availableCount: {
              decrement: dto.rooms,
            },
          },
        });
        if (result.count !== 1) {
          throw new ConflictException('inventory changed, please retry');
        }
      }

      let totalPrice = new Prisma.Decimal(0);
      for (const inventory of inventories) {
        totalPrice = totalPrice.add(inventory.price.mul(dto.rooms));
      }

      return tx.booking.create({
        data: {
          hotelId: room.hotelId,
          roomId: room.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          rooms: dto.rooms,
          totalPrice,
        },
      });
    });
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
      throw new BadRequestException('invalid date');
    }
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('checkOut must be after checkIn');
    }
    return { checkInDate, checkOutDate };
  }

  private diffInDays(start: Date, end: Date) {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((end.getTime() - start.getTime()) / msPerDay);
  }

  private assertInventoryCoverage(
    inventories: { date: Date }[],
    checkInDate: Date,
    nights: number,
  ) {
    if (inventories.length !== nights) {
      throw new BadRequestException(
        'inventory not generated for full date range',
      );
    }
    for (let i = 0; i < nights; i += 1) {
      const expected = this.addDays(checkInDate, i).getTime();
      if (inventories[i].date.getTime() !== expected) {
        throw new BadRequestException('inventory not continuous');
      }
    }
  }

  private addDays(base: Date, offset: number) {
    const cloned = new Date(base);
    cloned.setDate(cloned.getDate() + offset);
    cloned.setHours(0, 0, 0, 0);
    return cloned;
  }
}
