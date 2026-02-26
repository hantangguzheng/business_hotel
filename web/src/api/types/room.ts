import type { AccessibleFacility, AmenityFacility, AreaTitle, BathingFacility, 
    BathroomFacility, BedTitle, ChildFacility, CleaningFacility, FoodFacility, 
    KitchenFacility, LayoutFacility, MediaFacility, NetworkFacility, 
    RoomSpecFacility, TwoOption, ViewFacility } from "@/types/room"
import type { IImagePayload } from "./api"

export interface IRoomPayload {
    name: string

    areaTitle: AreaTitle
    bedTitle: BedTitle
    windowTitle: TwoOption
    floorTitle: string
    smokeTitle: TwoOption
    wifiInfo?: TwoOption

    pictureUrl?: string

    cleaningFacilities?: CleaningFacility[];
    bathingFacilities?: BathingFacility[];
    layoutFacilities?: LayoutFacility[];
    accessibleFacilities?: AccessibleFacility[];
    networkFacilities?: NetworkFacility[];
    bathroomFacilities?: BathroomFacility[];
    foodFacilities?: FoodFacility[];
    childFacilities?: ChildFacility[];
    mediaFacilities?: MediaFacility[];
    roomSpecFacilities?: RoomSpecFacility[];
    kitchenFacilities?: KitchenFacility[];
    amenityFacilities?: AmenityFacility[];
    viewFacilities?: ViewFacility[];

    price: string
    totalStock: number
    capacity?: number
};

export interface IRoomCreateRequest extends IRoomPayload, IImagePayload {

}

export interface IRoomListResponse extends IRoomPayload {
    id: number,
    hotelId:number,
}