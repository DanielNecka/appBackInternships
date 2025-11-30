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
import * as fs from 'fs';

type RequestWithBody = Request & { body: Record<string, unknown> };

type StoredImageFile = {
  filename: string;
  originalname: string;
  mimetype?: string;
  size?: number;
};

type IncomingImageFile = {
  originalname: string;
};

const IMAGES_DIRECTORY = path.resolve(process.cwd(), '..', 'app-front', 'public', 'carsImages');
const RELATIVE_IMAGE_PREFIX = 'carsImages';

function ensureImagesDirectory(): void {
  if (!fs.existsSync(IMAGES_DIRECTORY)) {
    fs.mkdirSync(IMAGES_DIRECTORY, { recursive: true });
  }
}

function sanitizeSegment(segment: string | undefined): string {
  return (segment ?? 'samochod')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'samochod';
}

function normalizeForComparison(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function nextImageIndex(baseName: string): number {
  ensureImagesDirectory();
  const files = fs.readdirSync(IMAGES_DIRECTORY);
  const normalizedBase = normalizeForComparison(baseName);

  const indices = files
    .map((fileName) => {
      const parsedName = path.parse(fileName).name;
      const match = parsedName.match(/-(\d+)$/);
      const candidateBase = match ? parsedName.slice(0, -match[0].length) : parsedName;
      const normalizedCandidate = normalizeForComparison(candidateBase);

      if (normalizedCandidate !== normalizedBase) {
        return null;
      }

      if (!match) {
        return 0;
      }

      const parsedIndex = Number.parseInt(match[1], 10);
      return Number.isNaN(parsedIndex) ? 0 : parsedIndex;
    })
    .filter((value): value is number => value !== null);

  const currentMax = indices.length ? Math.max(...indices) : 0;
  return currentMax + 1;
}

function generateImageName(req: RequestWithBody, file: IncomingImageFile): string {
  const brand = sanitizeSegment(req.body.brand as string | undefined);
  const model = sanitizeSegment(req.body.model as string | undefined);
  const baseName = [brand, model].filter(Boolean).join('-') || 'samochod';
  const ext = path.extname(file.originalname)?.toLowerCase() || '.png';
  const index = nextImageIndex(baseName);

  return `${baseName}-${index}${ext}`;
}

const imageStorage = diskStorage({
  destination: (_req, _file, callback) => {
    ensureImagesDirectory();
    callback(null, IMAGES_DIRECTORY);
  },
  filename: (req, file, callback) => {
    const filename = generateImageName(req as RequestWithBody, file as IncomingImageFile);
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
      ? `${RELATIVE_IMAGE_PREFIX}/${image.filename}`
      : (carData.image as string | undefined);

    const normalizedImagePath = rawImagePath
      ? rawImagePath
          .trim()
          .replace(/\\/g, '/')
          .replace(/^[\\/]+/, '')
      : undefined;

    const finalImagePath = normalizedImagePath
      ? normalizedImagePath.startsWith(`${RELATIVE_IMAGE_PREFIX}/`)
        ? normalizedImagePath
        : `${RELATIVE_IMAGE_PREFIX}/${normalizedImagePath}`
      : undefined;

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
