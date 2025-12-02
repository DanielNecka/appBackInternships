import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, LessThan, MoreThan, Repository } from 'typeorm';
import { Cars } from 'src/entity/cars.entity';
import { Car } from '../models/car.model';
import { ApiError } from '../models/error.model';
import { CarSearch } from '../models/carSearch.model';
import { imagePath } from './image.constants';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Cars)
    private carsRepository: Repository<Cars>
  ) { }

  async findAllCars(): Promise<Car[] | ApiError> {
    const cars = await this.carsRepository.find({ order: { id: 'DESC' } });

    if (!cars) {
      return { msg: 'Błąd pobrania samochodów' };
    }

    return cars;
  }

  async findCarById(id: number): Promise<Car | ApiError> {
    const car = await this.carsRepository.findOneBy({ id });

    if (!car) {
      return { msg: `Błąd pobrania samochodu o id: ${id}` };
    }

    return {
      id: car.id,
      brand: car.brand,
      model: car.model,
      price: car.price,
      image: imagePath(car.image, 'public'),
      isRented: car.isRented ?? undefined,
      fuelType: car.fuelType ?? undefined,
    };
  }

  async searchCars(carData: CarSearch, sortType: 'ASC' | 'DESC'): Promise<Car[] | ApiError> {
    const where: FindOptionsWhere<Cars> = {};

    carData.brand
      ? where.brand = ILike(`%${carData.brand}%`) : null;
    carData.model
      ? where.model = ILike(`%${carData.model}%`) : null;
    carData.price
      ? where.price = carData.price : null;
    carData.maxPrice
      ? where.price = LessThan(carData.maxPrice) : null;
    carData.minPrice
      ? where.price = MoreThan(carData.minPrice) : null;
    carData.minPrice && carData.maxPrice
      ? where.price = Between(carData.minPrice, carData.maxPrice) : null;
    carData.isRedted
      ? (where.isRented = true) : null;

    const cars = await this.carsRepository.find({
      where,
      order: {
        price: sortType,
      },
    });

    if (!cars) {
      return { msg: 'Nie znaleziono samochodu o danych kryteriach' };
    }

    return cars;
  }

  async deleteCarById(id: number): Promise<string> {
    const carToDelete = await this.carsRepository.findOne({ where: { id } });

    if (!carToDelete) {
      return `Samochód o id ${id} nie istnieje`;
    }

    const result = await this.carsRepository.delete(id);

    if (!result.affected) {
      return `Samochód o id ${id} nie istnieje`;
    }

    return `Samochód o id ${id} został usunięty`;
  }

  async addCar(carData: Car): Promise<ApiError | { msg: string; addedCar: Car }> {
    const savedCar = await this.carsRepository.save({
      ...carData,
      image: imagePath(carData.image)
    });

  return savedCar ? { msg: `Pomyślnie dodano samochód ${savedCar.brand} ${savedCar.model} z ceną ${savedCar.price} zł/h.`, addedCar: savedCar }
    : { msg: `Błąd dodania samochodu ${carData.brand}, ${carData.model}`};
  }


  async updateCarData(id: number, carData: Car): Promise<ApiError> {
    const currentCar = await this.findCarById(id);

    if ('msg' in currentCar) {
      return { msg: currentCar.msg };
    }

    const result = await this.carsRepository.update(id, {
      brand: carData.brand,
      model: carData.model,
      price: carData.price,
      fuelType: carData.fuelType,
      isRented: carData.isRented ?? false,
    });

    return result.affected
      ? { msg: `Pomyślnie zaktualizowano samochód o id: ${id}\n\nStare dane: \nmarka: ${currentCar.brand} \nmodel: ${currentCar.model} \ncena: ${currentCar.price}\n\nNowe dane: \nmarka: ${carData.brand} \nmodel: ${carData.model} \ncena: ${carData.price}` }
      : { msg: `Nie udało się zaktualizować samochodu o id: ${id}` };
  }
}