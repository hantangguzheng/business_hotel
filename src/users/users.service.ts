import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    username: string,
    passwordHash: string,
    role: Role = Role.MERCHANT,
  ): Promise<User> {
    return await this.prisma.user.create({
      data: {
        username,
        password: passwordHash,
        role,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
}
