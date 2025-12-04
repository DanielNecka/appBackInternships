import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModule } from './car_rental/car.module'
import * as path from 'path';
import { Users } from './entity/users.entity';
import { UserModule } from './user/user.module';
import { Cars } from './entity/cars.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), 'storage'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'car_rental',
      entities: [Cars, Users]
    }),
    CarModule,
    UserModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
