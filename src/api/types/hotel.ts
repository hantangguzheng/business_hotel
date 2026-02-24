import type { IImagesPayload } from "@/api/types/api"

export type HotelTag = "BUFFET_BREAKFAST" | "CHESS_ROOM" | "MEMBER_BENEFITS" | 
    "CHARGING_PILE" | "FREE_WIFI" | "INSTAGRAMMABLE" | "GYM" | "BUTLER_SERVICE" | 
    "COFFEE_MACHINE" | "SELF_CHECKIN" | "MEETING_HALL" | "VINTAGE_STYLE" | 
    "CINEMA_ROOM" | "ROBOT_SERVICE" | "SMART_CONTROL" | "FAMILY_ROOM" | 
    "LAUNDRY_ROOM" | "FREE_LUGGAGE" | "FREE_PARKING" | "DRYER" | "KTV" | 
    "FREE_LAUNDRY" | "SUITE" | "HEATING" | "DELIVERY_ROBOT" | "NON_SMOKING_FLOOR";

export interface IHotelCreateRequest extends IImagesPayload {
    nameCn:string
    nameEn:string
    address:string
    starRating:number
    cityCode:string
    openingDate:string
    shortTags?: HotelTag[]

    score?:number
    totalReviews?:number
    
    latitude:number
    longitude:number

    price: string
    crossLinePrice?: string
    currency?: string

}

export interface IHotelListResponseSingle {
    id: number;
    nameCn: string;
    address: string;
    starRating: number;
    cityCode: string;
    openingDate: Date;
    imageUrls: string[];
    score: number;
    totalReviews: number;
    price: number;
    crossLinePrice: number | null;
    currency: string;
    shortTags: HotelTag[];
    latitude: number;
    longitude: number;
    merchantId: number;
    status: number;
    auditReason: string | null;
}