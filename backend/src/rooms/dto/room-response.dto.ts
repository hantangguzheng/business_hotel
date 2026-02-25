export class RoomListItemDto {
  id!: number;
  hotelId!: number;
  name!: string;
  areaTitle!: string;
  bedTitle!: string;
  windowTitle!: string;
  smokeTitle!: string;
  wifiInfo?: string | null;
  pictureUrl!: string;
  price!: number;
  priceOriginal!: number;
  priceDiscounted!: number;
  availableCount!: number;

  constructor(partial: Partial<RoomListItemDto>) {
    Object.assign(this, partial);
  }
}

export class RoomDetailDto extends RoomListItemDto {
  floorTitle?: string | null;
  cleaningFacilities: string[] = [];
  bathingFacilities: string[] = [];
  layoutFacilities: string[] = [];
  accessibleFacilities: string[] = [];
  networkFacilities: string[] = [];
  bathroomFacilities: string[] = [];
  foodFacilities: string[] = [];
  childFacilities: string[] = [];
  mediaFacilities: string[] = [];
  roomSpecFacilities: string[] = [];
  kitchenFacilities: string[] = [];
  amenityFacilities: string[] = [];
  viewFacilities: string[] = [];
  capacity!: number;

  constructor(partial: Partial<RoomDetailDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
