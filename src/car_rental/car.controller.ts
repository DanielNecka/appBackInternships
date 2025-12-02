import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CarService } from './car.service';
import type { Car } from '../models/car.model';
import type { CarSearch } from '../models/carSearch.model';
import type { ApiError } from '../models/error.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import * as path from 'path';
import { IMAGE_DIR_NAME, IMAGE_DIR_PATH, imagePath } from './image.constants';

type RequestWithBody = Request & { body: Record<string, unknown> };

type StoredImageFile = {
  filename: string;
  originalname: string;
  mimetype?: string;
  size?: number;
};

function generateImageName(req: RequestWithBody, file: { originalname?: string }): string {
  const rawBrand = (req.body.brand as string | undefined)?.trim() || 'samochod';
  const rawModel = (req.body.model as string | undefined)?.trim() || '';
  const base = [rawBrand, rawModel]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'samochod';

  const ext = path.extname(file.originalname ?? '').toLowerCase() || '.png';
  const uniqueSuffix = Date.now().toString(36);

  imagePath(undefined, 'ensure');

  return `${base}-${uniqueSuffix}${ext}`;
}

const imageStorage = diskStorage({
  destination: (_req, _file, callback) => {
    imagePath(undefined, 'ensure');
    callback(null, IMAGE_DIR_PATH);
  },
  filename: (req, file, callback) => {
    const filename = generateImageName(req as RequestWithBody, file);
    callback(null, filename);
  },
});

function normalizeBoolean(input: unknown, fallback = false): boolean {
  if (typeof input === 'boolean') {
    return input;
  }
  if (typeof input === 'string') {
    const lower = input.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lower)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(lower)) {
      return false;
    }
  }
  return fallback;
}

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  findAllCars(): Promise<Car[] | ApiError> {
    return this.carService.findAllCars();
  }

  @Get(':id')
  findCarById(@Param('id', ParseIntPipe) id: number): Promise<Car | ApiError> {
    return this.carService.findCarById(id);
  }

  @Post('search')
  searchCars(@Body() carData: CarSearch): Promise<Car[] | ApiError> {
    return this.carService.searchCars(carData, 'ASC');
  }

  @Delete(':id')
  deleteCarById(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.carService.deleteCarById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  addCar(
    @UploadedFile() image: StoredImageFile | undefined,
    @Body() carData: Record<string, unknown>,
  ): Promise<ApiError | { msg: string; addedCar: Car }> {
    const price = Number(carData.price);
    const rawImagePath = image
      ? `${IMAGE_DIR_NAME}/${image.filename}`
      : (carData.image as string | undefined);
    const finalImagePath = imagePath(rawImagePath);

    const normalizedCar: Car = {
      brand: (carData.brand as string)?.trim() ?? '',
      model: (carData.model as string)?.trim() ?? '',
      price: Number.isNaN(price) ? 0 : price,
      image: finalImagePath,
      isRented: normalizeBoolean(carData.isRented, false),
      fuelType: (carData.fuelType as string | undefined)?.trim() || undefined,
    };

    return this.carService.addCar(normalizedCar);
  }

  @Patch(':id')
  updateCarData(@Param('id', ParseIntPipe) id: number, @Body() carData: Car): Promise<ApiError> {
    return this.carService.updateCarData(id, carData);
  }
}
