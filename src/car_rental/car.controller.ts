import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CarService } from './car.service';
import { Cars } from '../entity/cars.entity'
import { Car } from '../models/car.model'

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  findAllCars(): Promise<Car[]>{
    return this.carService.findAllCars();
  }

  @Get('id/:id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<Car | null> {
    return this.carService.findById(id);
  }

  @Get('brand/:brand')
  findByBrand(@Param('brand') brand: string): Promise<Car[] | null> {
    return this.carService.findByBrand(brand);
  }
}
