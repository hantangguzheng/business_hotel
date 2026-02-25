import type { IImagesPayload } from "@/api/types/api"
import type { CityCode, HotelTag, PromotionType } from "@/types/hotel"


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

    imageUrls?:string[]

}

export interface IHotelListResponseSingle {
    id: number;
    nameCn: string;
    nameEn?: string;
    address: string;
    starRating: number;
    cityCode: CityCode;
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

export interface IPromotionCreateRequest {
    promotionType: PromotionType;

    discount: string;

    startDate: string;

    endDate: string;
}