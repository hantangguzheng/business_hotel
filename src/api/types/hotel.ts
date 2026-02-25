import type { IImagesPayload } from "@/api/types/api"
import type { CityCode, HotelStatus, HotelTag, PromotionType } from "@/types/hotel"


export interface IHotelCreateRequest extends IImagesPayload {
    nameCn: string
    nameEn: string
    address: string
    starRating: number
    cityCode: string
    openingDate: string
    shortTags?: HotelTag[]

    score?: number
    totalReviews?: number

    latitude: number
    longitude: number

    price: string
    crossLinePrice?: string
    currency?: string

    imageUrls?: string[]

}

export interface IHotelListResponseSingle extends IAdminHotelAdditionPayload {
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
    status: HotelStatus;
    auditReason: string | null;
}

export interface IPromotionCreateRequest {
    promotionType: PromotionType;
    discount: string;
    startDate: string;
    endDate: string;
}

export interface IPromotionListRespone {
    id: number,
    hotelId: number,
    promotionType: PromotionType;
    discount: string;
    startDate: string;
    endDate: string;
    createAt: string;
    updatedAt: string;
}

export interface IAdminHotelQuery {
    status?: HotelStatus;
    cityCode?: CityCode;
    keyword?: string;
}

export interface IAdminRejectRequest {
    auditReason: string;
}

export interface IAdminHotelAdditionPayload {
    create_at?: string;
}