import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cars } from 'src/entity/cars.entity';
import { Car } from '../models/car.model'

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Cars) 
    private carsRepository: Repository<Cars>
  ) {}

  findAllCars(): Promise<Car[]> {
    return this.carsRepository.find();
  }

  findById(id: number): Promise<Car | null> {
    return this.carsRepository.findOneBy({ id });
  }

  findByBrand(brand: string): Promise<Car [] | null> {
    return this.carsRepository.find({where: { brand }});
  }
}