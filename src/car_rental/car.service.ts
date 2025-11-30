import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, LessThan, MoreThan, Repository } from 'typeorm';
import { Cars } from 'src/entity/cars.entity';
import { Car } from '../models/car.model';
import { ApiError } from '../models/error.model';
import { CarSearch } from '../models/carSearch.model';

@Injectable()
export class CarService {
  constructor(
  @InjectRepository(Cars) 
    private carsRepository: Repository<Cars>
  ) {}

  async findAllCars(): Promise<Car[] | ApiError> {
    const cars = await this.carsRepository.find({ order: { id: 'DESC' },});
    const mappedCars = cars.map((car) => this.mapEntityToCar(car));

    return mappedCars.length ? mappedCars : { msg: 'Błąd pobrania samochodów' };
  }

  async findCarById(id: number): Promise<Car | ApiError> {
    const car = await this.carsRepository.findOneBy({ id });

    return car ? this.mapEntityToCar(car) : { msg: `Błąd pobrania samochodu o id: ${id}` };
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
        price: sortType
      } 
    });

    const mappedCars = cars.map((car) => this.mapEntityToCar(car));

    return mappedCars.length 
      ? mappedCars : { msg: 'Nie znaleziono samochodu o danych kryteriach'};
  }

  async deleteCarById(id: number): Promise<string> {
    const result = await this.carsRepository.delete(id);

    return result.affected 
      ? `Samochód o id ${id} został usunięty` 
      : `Samochód o id ${id} nie istnieje`
  }

  async addCar(carData: Car): Promise<ApiError | { msg: string; addedCar: Car }> {
    const savedCar = await this.carsRepository.save({
      brand: carData.brand,
      model: carData.model,
      price: carData.price,
      image: carData.image,
      isRented: carData.isRented,
      fuelType: carData.fuelType,
    });

    return savedCar 
      ? { msg: `Pomyślnie dodano samochód ${savedCar.brand} ${savedCar.model} z ceną ${savedCar.price} zł/h.`, addedCar: this.mapEntityToCar(savedCar)} 
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
    });

    return result.affected
      ? { msg : `Pomyślnie zaktualizowano samochód o id: ${id}\n\nStare dane: \nmarka: ${currentCar.brand} \nmodel: ${currentCar.model} \ncena: ${currentCar.price}\n\nNowe dane: \nmarka: ${carData.brand} \nmodel: ${carData.model} \ncena: ${carData.price}`}
      : { msg: `Nie udało się zaktualizować samochodu o id: ${id}`};
  }

  private mapEntityToCar(entity: Cars): Car {
    const { id, brand, model, price, image, isRented, fuelType } = entity;

    return {
      id,
      brand,
      model,
      price,
      image: this.normalizeImagePath(image),
      isRented: isRented ?? undefined,
      fuelType: fuelType ?? undefined,
    };
  }

  private normalizeImagePath(image?: string | null): string | undefined {
    if (!image) {
      return undefined;
    }

    const trimmed = image.trim();

    if (!trimmed) {
      return undefined;
    }

    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    const cleaned = trimmed.replace(/\\/g, '/').replace(/^[\\/]+/, '');

    return cleaned.startsWith('carsImages/')
      ? cleaned
      : `carsImages/${cleaned}`;
  }
}