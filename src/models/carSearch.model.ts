import { Car } from '../models/car.model';

export interface CarSearch extends Car {
    maxPrice?: number;
    minPrice?: number;
}