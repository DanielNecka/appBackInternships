import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { User } from 'src/models/user.model';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(): Promise<User[] | null> {
    return this.userService.getUsers();
  }

  @Post('/login')
  loginUser(@Body() data: {login: string, password: string}): Promise<User | null > {
    return this.userService.loginUser(data);
  }
}
