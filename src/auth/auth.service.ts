import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { use } from 'passport';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor (
        private readonly userService: UserService, 
        private readonly jwtService: JwtService
    ) {}

    async validateUser(login: string, userPassword: string, role: string) {
        const user = await this.userService.loginUser(login);

        if (!user) {
            throw new UnauthorizedException('Nieprawidłowe dane logowania')
        }

        const hashedPassword = createHash('sha1').update(userPassword).digest('hex');

        if (user.password !== hashedPassword) {
            throw new UnauthorizedException('Nieprawidłowe dane logowania')
        }

        const { password, ...result } = user;

        return result;
    }

    async login(user: any) {
        const payload = {
            sub: user.id, 
            login: user.login,
            role: user.role
        };

        return {access_token: this.jwtService.sign(payload)}
    }
}
