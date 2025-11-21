import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Cars } from 'src/entity/cars.entity';
import { Car } from '../models/car.model';

@Injectable()
export class CarService {
  constructor(
  @InjectRepository(Cars) 
    private carsRepository: Repository<Cars>
  ) {}

  findAllCars(): Promise<Car[]> {
    return this.carsRepository.find();
  }

  async findCarById(id: number): Promise<Car | string> {
    const car = await this.carsRepository.findOneBy({ id });

    return car ? car : `Samochód o id: ${id} nie istnieje`;
  }

  async searchCars(carData: Car): Promise<Car[] | string> {
    const where: FindOptionsWhere<Car> = {};

    carData.brand 
      ? where.brand = ILike(`%${carData.brand}%`) : null;
    carData.model 
      ? where.model = ILike(`%${carData.model}%`) : null;
    carData.price 
        ? where.price = carData.price : null;

    const cars = await this.carsRepository.find({ where });

    return cars.length 
      ? cars : 'Nie znaleziono samochodu o danych wymaganiach';
  }

  async deleteCarById(id: number): Promise<string> {
    const result = await this.carsRepository.delete(id);

    return result.affected 
      ? `Samochód o id ${id} został usunięty` 
      : `Samochód o id ${id} nie istnieje`
  }

  async addCar(carData: Car): Promise<string | object> {
    const savedCar = await this.carsRepository.save(carData);

    return savedCar 
      ? { message: `Pomyślnie dodano samochód ${savedCar.brand} ${savedCar.model} z ceną ${savedCar.price} zł/h.`, addedCar: savedCar} 
      : `Błąd dodania samochodu ${carData.brand}, ${carData.model}`; 
  }

  async updateCarData(id: number, carData: Car): Promise<string> {
    const currentCar = await this.findCarById(id);

    if (typeof currentCar === 'string') {
      return currentCar;
    }

    const result = await this.carsRepository.update(id, {
      brand: carData.brand,
      model: carData.model,
      price: carData.price,
    });

    return result.affected
      ? `Pomyślnie zaktualizowano samochód o id: ${id}\n\nStare dane: \nmarka: ${currentCar.brand} \nmodel: ${currentCar.model} \ncena: ${currentCar.price}\n\nNowe dane: \nmarka: ${carData.brand} \nmodel: ${carData.model} \ncena: ${carData.price}`
      : `Nie udało się zaktualizować samochodu o id: ${id}`;
  }
}