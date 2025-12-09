import { Injectable, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { JwtConfigService } from './jwt.config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: JwtConfigService
    }) 
  ],
  exports: [AuthService],
  providers: [
    AuthService,
    JwtStrategy,
    JwtConfigService
  ],
  controllers: [AuthController]
})
export class AuthModule {}
