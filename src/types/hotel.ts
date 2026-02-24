export const HotelStatus = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    OFFLINED: 3,
} as const;

export type HotelStatus = typeof HotelStatus[keyof typeof HotelStatus];

export const CityCode = {
    BEIJING: '1',
    SHANGHAI: '2',
} as const;

export type CityCode = typeof CityCode[keyof typeof CityCode];