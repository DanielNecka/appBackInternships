import * as fs from 'fs';
import * as path from 'path';

export const STATIC_SERVE_ROOT = '/uploads';
export const IMAGE_DIRECTORY_NAME = 'car-images';
export const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');
export const IMAGES_DIRECTORY = path.join(STORAGE_ROOT, IMAGE_DIRECTORY_NAME);
export const RELATIVE_IMAGE_PREFIX = IMAGE_DIRECTORY_NAME;

const DEFAULT_PUBLIC_IMAGE_BASE_URL = `http://localhost:3000${STATIC_SERVE_ROOT}`;
const configuredBaseUrl = process.env.IMAGE_PUBLIC_BASE_URL || process.env.APP_PUBLIC_URL;
const sanitizedConfiguredBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, '')
  : '';

export const PUBLIC_IMAGE_BASE_URL = sanitizedConfiguredBaseUrl
  ? `${sanitizedConfiguredBaseUrl}${STATIC_SERVE_ROOT}`
  : DEFAULT_PUBLIC_IMAGE_BASE_URL;

export function ensureImagesDirectory(): void {
  if (!fs.existsSync(IMAGES_DIRECTORY)) {
    fs.mkdirSync(IMAGES_DIRECTORY, { recursive: true });
  }
}

export function normalizeImageStoragePath(rawPath?: string | null): string | undefined {
  if (!rawPath) {
    return undefined;
  }

  const trimmed = rawPath.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  let cleaned = trimmed.replace(/\\/g, '/').replace(/^[\\/]+/, '');
  cleaned = cleaned.replace(/^public\//i, '');
  cleaned = cleaned.replace(/^uploads\//i, '');
  cleaned = cleaned.replace(/^carsImages\//i, `${RELATIVE_IMAGE_PREFIX}/`);

  if (!cleaned.startsWith(`${RELATIVE_IMAGE_PREFIX}/`)) {
    cleaned = `${RELATIVE_IMAGE_PREFIX}/${cleaned}`;
  }

  return cleaned;
}

export function buildPublicImageUrl(storedPath?: string | null): string | undefined {
  if (!storedPath) {
    return undefined;
  }

  if (/^https?:\/\//i.test(storedPath) || storedPath.startsWith('data:')) {
    return storedPath;
  }

  const normalized = normalizeImageStoragePath(storedPath);

  if (!normalized) {
    return undefined;
  }

  const normalizedPath = normalized.replace(/\\/g, '/').replace(/^[\\/]+/, '');

  return `${PUBLIC_IMAGE_BASE_URL}/${normalizedPath}`;
}

export function resolveImageAbsolutePath(storedPath?: string | null): string | undefined {
  const normalized = normalizeImageStoragePath(storedPath);

  if (!normalized) {
    return undefined;
  }

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith('data:')) {
    return undefined;
  }

  const relative = normalized.startsWith(`${RELATIVE_IMAGE_PREFIX}/`)
    ? normalized.slice(RELATIVE_IMAGE_PREFIX.length + 1)
    : normalized;

  return path.join(IMAGES_DIRECTORY, relative);
}
