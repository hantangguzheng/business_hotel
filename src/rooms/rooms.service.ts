/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  // 创建房型前先校验：hotel 是否属于当前 merchant
  async create(merchantId: number, hotelId: number, dto: CreateRoomDto) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');

    return this.prisma.room.create({
      data: {
        hotelId,
        roomName: dto.roomName,
        price: dto.price, // Prisma Decimal 可接受 string
        originalPrice: dto.originalPrice,
        stock: dto.stock,
      },
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

  async update(merchantId: number, roomId: number, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('room not found');

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: room.hotelId },
    });
    if (!hotel) throw new NotFoundException('hotel not found');
    if (hotel.merchantId !== merchantId)
      throw new ForbiddenException('no permission');

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        roomName: dto.roomName,
        price: dto.price,
        originalPrice: dto.originalPrice,
        stock: dto.stock,
      },
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
}
