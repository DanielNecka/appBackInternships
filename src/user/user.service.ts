import { Injectable } from '@nestjs/common';
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

  loginUser(data: {login: string, password: string}): Promise<User | null> {
    const passwordSha1 = createHash('sha1').update(data.password).digest('hex');

    return this.userRepository.findOne({
      select: {
        id: true,
        login: true
      },
      where: {
        login: data.login,
        password: passwordSha1
      }
    });
  }
}