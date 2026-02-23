export type SearchRoomTagFilters = {
  areaTitles?: string[];
  bedTitles?: string[];
  window?: string;
  smoke?: string;
  wifi?: string;
};

export type SearchRoomFacilityFilters = {
  cleaningFacilities?: string[];
  bathingFacilities?: string[];
  layoutFacilities?: string[];
  accessibleFacilities?: string[];
  networkFacilities?: string[];
  bathroomFacilities?: string[];
  foodFacilities?: string[];
  childFacilities?: string[];
  mediaFacilities?: string[];
  roomSpecFacilities?: string[];
  kitchenFacilities?: string[];
  amenityFacilities?: string[];
  viewFacilities?: string[];
};

export type SearchHotelsParams = {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  minStar?: number;
  maxStar?: number;
  minScore?: number;
  tags?: string[];
  sortBy?: "distance" | "price" | "score";
  cityCode?: string;
  userLat?: number;
  userLng?: number;
  checkIn?: string;
  checkOut?: string;
  roomsNeeded?: number;
  peopleNeeded?: number;
  room?: {
    tags?: SearchRoomTagFilters;
    facilities?: SearchRoomFacilityFilters;
  };
  page?: number;
  pageSize?: number;
};

export type PromotionItem = {
  id: number;
  hotelId: number;
  promotionType: string;
  discount?: number;
  startDate: string;
  endDate: string;
}

export type HotelListItem = {
  id: number;
  merchantId?: number;
  nameCn: string;
  nameEn?: string;
  imageUrls?: string[];
  shortTags?: string[];
  starRating?: number;
  score?: number;
  totalReviews?: number;
  price?: number;
  crossLinePrice?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  cityCode?: string;
  openingDate?: string;
  status?: number;
  distance?: number;
  promotions?: PromotionItem[];
};

export type SearchHotelsResponse = {
  total: number;
  data: HotelListItem[];
};

export type SearchRoomsParams = {
  hotelId: number;
  tags?: SearchRoomTagFilters;
  facilities?: SearchRoomFacilityFilters;
  checkIn?: string;
  checkOut?: string;
  roomsNeeded?: number;
  peopleNeeded?: number;
  page?: number;
  pageSize?: number;
};

export type SearchRoomsResponse = {
  total: number;
  data: HotelRoomItem[];
  promotions?: PromotionItem[];
};

export type HotelRoomItem = {
  id: number;
  hotelId: number;
  name: string;
  price?: number;
  priceOriginal?: number;
  priceDiscounted?: number;
  capacity?: number;
  availableCount?: number;
  floorTitle?: string;
  areaTitle?: string;
  bedTitle?: string;
  windowTitle?: string;
  smokeTitle?: string;
  wifiInfo?: string;
  cleaningFacilities?: string[];
  bathingFacilities?: string[];
  layoutFacilities?: string[];
  accessibleFacilities?: string[];
  networkFacilities?: string[];
  bathroomFacilities?: string[];
  foodFacilities?: string[];
  childFacilities?: string[];
  mediaFacilities?: string[];
  roomSpecFacilities?: string[];
  kitchenFacilities?: string[];
  amenityFacilities?: string[];
  viewFacilities?: string[];
  pictureUrl?: string;
  
};

export type HotelDetailItem = {
  id: number;
  nameCn: string;
  nameEn?: string;
  imageUrls?: string[];
  starRating?: number;
  score?: number;
  totalReviews?: number;
  price?: number;
  currency?: string;
  shortTags?: string[];
  address?: string;
  cityCode?: string;
  openingDate?: string;
  latitude?: number;
  longitude?: number;
};
