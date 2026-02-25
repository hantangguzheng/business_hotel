import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string, role: Role) {
    const exists = await this.usersService.findByUsername(username);
    if (exists) throw new BadRequestException('username already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(username, passwordHash, role);

    return this.sign(user.id, user.username, user.role);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    return this.sign(user.id, user.username, user.role);
  }

  private sign(id: number, username: string, role: Role) {
    return {
      access_token: this.jwtService.sign({ sub: id, username, role }),
    };
  }
}
