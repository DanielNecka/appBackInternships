import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CarService } from './car.service';
import { Car } from '../models/car.model';
import { PostgresDriver } from 'typeorm/browser/driver/postgres/PostgresDriver.js';

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  findAllCars(): Promise<Car[]>{
    return this.carService.findAllCars();
  }

  @Get(':id')
  findCarById(@Param('id', ParseIntPipe) id: number): Promise<Car | string> {
    return this.carService.findCarById(id);
  }

  @Post('search')
  searchCars(@Body() carData: Car): Promise<Car[] | string> {
    return this.carService.searchCars(carData);
  }

  @Delete(':id')
  deleteCarById(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.carService.deleteCarById(id);
  }

  @Post()
  addCar(@Body() carData: Car): Promise<string | object> {
    return this.carService.addCar(carData);
  }

  @Patch(':id')
  updateCarData(@Param('id', ParseIntPipe) id: number, @Body() carData: Car) {
    return this.carService.updateCarData(id, carData);
  }
}
