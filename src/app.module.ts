import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModule } from './car_rental/car.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'car_rental',
      entities: [__dirname + '/**/*.entity{.ts,.js}']
    }),
    CarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
