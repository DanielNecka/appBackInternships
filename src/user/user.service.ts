import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Users } from 'src/entity/users.entity';
import { User } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>
  ) { }

  getUsers(): Promise<User[] | null> {
    return this.userRepository.find();
  }

  loginUser(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { login }
    });
  }
}