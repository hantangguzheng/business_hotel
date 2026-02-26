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

export type HotelTag = "BUFFET_BREAKFAST" | "CHESS_ROOM" | "MEMBER_BENEFITS" |
    "CHARGING_PILE" | "FREE_WIFI" | "INSTAGRAMMABLE" | "GYM" | "BUTLER_SERVICE" |
    "COFFEE_MACHINE" | "SELF_CHECKIN" | "MEETING_HALL" | "VINTAGE_STYLE" |
    "CINEMA_ROOM" | "ROBOT_SERVICE" | "SMART_CONTROL" | "FAMILY_ROOM" |
    "LAUNDRY_ROOM" | "FREE_LUGGAGE" | "FREE_PARKING" | "DRYER" | "KTV" |
    "FREE_LAUNDRY" | "SUITE" | "HEATING" | "DELIVERY_ROBOT" | "NON_SMOKING_FLOOR";

export type PromotionType = "FLASH_SALE" | "HOLIDAY_SPECIAL" | "WEEKEND_DEAL" |
    "NEW_OPEN" | "SEASONAL" | "MEMBER_EXCLUSIVE";