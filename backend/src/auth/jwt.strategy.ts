/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';

export type JwtUser = {
  userId: number;
  username: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'DEV_SECRET_CHANGE_ME',
    });
  }

  validate(payload: { sub: number; username: string; role: Role }): JwtUser {
    // 这里返回的对象会被挂到 req.user
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
