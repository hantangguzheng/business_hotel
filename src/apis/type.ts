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
};

export type SearchHotelsResponse = {
  total: number;
  data: HotelListItem[];
};
