import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post('test-create')
//   async testCreate(
//     @Body() body: { username: string; password: string; role?: Role },
//   ) {
//     const role: Role = body.role ?? Role.MERCHANT;
//     return await this.usersService.create(body.username, body.password, role);
//   }

//   @Get('test-find')
//   async testFind(@Query('username') username: string) {
//     return await this.usersService.findByUsername(username);
//   }

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user; // { userId, username, role }
  }
}
