import * as fs from 'fs';
import * as path from 'path';

export const STATIC_ROOT = '/uploads';
export const IMAGE_DIR_NAME = 'car-images';
export const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');
export const IMAGE_DIR_PATH = path.join(STORAGE_ROOT, IMAGE_DIR_NAME);
export const PUBLIC_BASE_URL = `http://localhost:3000${STATIC_ROOT}`;

export function imagePath(
  rawPath?: string | null,
  mode: 'relative' | 'public' | 'absolute' | 'ensure' = 'relative',
): string | undefined {
  if (mode === 'ensure') {
    if (!fs.existsSync(IMAGE_DIR_PATH)) {
      fs.mkdirSync(IMAGE_DIR_PATH, { recursive: true });
    }
    return IMAGE_DIR_PATH;
  }

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

  const cleaned = trimmed
    .replace(/\\/g, '/')
    .replace(/^[\\/]+/, '')
    .replace(/^public\//i, '')
    .replace(/^uploads\//i, '')
    .replace(/^carsImages\//i, `${IMAGE_DIR_NAME}/`);

  const relative = cleaned.startsWith(`${IMAGE_DIR_NAME}/`)
    ? cleaned
    : `${IMAGE_DIR_NAME}/${cleaned}`;

  if (mode === 'public') {
    const normalized = relative.replace(/\\/g, '/');
    return `${PUBLIC_BASE_URL}/${normalized}`;
  }

  if (mode === 'absolute') {
    const filename = relative.slice(IMAGE_DIR_NAME.length + 1);
    return path.join(IMAGE_DIR_PATH, filename);
  }

  return relative;
}
