export type SearchHotelsParams = {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  minStar?: number;
  minScore?: number;
  tags?: string[];
  cityCode?: string;
  userLat?: number;
  userLng?: number;
  checkIn?: string;
  checkOut?: string;
  roomsNeeded?: number;
  peopleNeeded?: number;
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
