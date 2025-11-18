import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getId(id: number): string {
    return `id: ${id}`;
  }

  getUserInfo(data: object): string {
    const object = data as { login: string; name: string };

    return `Login: ${object.login}, Nazwa: ${object.name}`;
  }

  getUserInfoAndId(id: number, data: object): string {
    const object = data as { login: string; name: string };

    return `Id: ${id}, Login: ${object.login}, Nazwa: ${object.name}`;
  }
}