import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards
} from '@nestjs/common';
import { User } from 'src/models/user.model';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getUsers(): Promise<User[] | null> {
    return this.userService.getUsers();
  }

  @Post('/login')
  loginUser(@Body() data: {login: string, password: string}): Promise<User | null > {
    return this.userService.loginUser(data?.login);
  }
}
