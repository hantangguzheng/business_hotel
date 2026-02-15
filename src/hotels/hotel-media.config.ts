import * as path from 'path';

export const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

export const HOTEL_IMAGE_DIR = path.join(UPLOAD_ROOT, 'hotels');
export const HOTEL_IMAGE_URL_PREFIX = '/static/hotels';
export const HOTEL_IMAGE_MAX_COUNT = 10;

export const ROOM_IMAGE_DIR = path.join(UPLOAD_ROOT, 'rooms');
export const ROOM_IMAGE_URL_PREFIX = '/static/rooms';
export const ROOM_IMAGE_MAX_COUNT = 5;
