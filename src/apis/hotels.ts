import Taro from "@tarojs/taro";
import type {
  HotelRoomItem,
  HotelDetailItem,
  SearchHotelsParams,
  SearchHotelsResponse,
  SearchRoomsParams,
  SearchRoomsResponse,
} from "./type";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.TARO_APP_API_BASE_URL) ||
  "http://localhost:3000";

export async function searchHotels(
  params: SearchHotelsParams,
): Promise<SearchHotelsResponse> {
  const cleanParams: SearchHotelsParams = {};

  const toIsoDateTime = (value?: string) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T00:00:00.000Z`;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }

    return parsed.toISOString();
  };

  const keyword = typeof params.keyword === "string" ? params.keyword.trim() : "";
  if (keyword) {
    cleanParams.keyword = keyword;
  }

  if (typeof params.minPrice === "number" && Number.isFinite(params.minPrice)) {
    const safeMinPrice = Math.max(0, params.minPrice);
    cleanParams.minPrice = safeMinPrice;
  }

  if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
    const safeMaxPrice = Math.max(0, params.maxPrice);
    cleanParams.maxPrice = safeMaxPrice;
  }

  if (
    typeof cleanParams.minPrice === "number" &&
    typeof cleanParams.maxPrice === "number" &&
    cleanParams.maxPrice < cleanParams.minPrice
  ) {
    delete cleanParams.maxPrice;
  }

  if (typeof params.minStar === "number" && Number.isFinite(params.minStar)) {
    const safeMinStar = Math.floor(params.minStar);
    if (safeMinStar >= 1 && safeMinStar <= 5) {
      cleanParams.minStar = safeMinStar;
    }
  }

  if (typeof params.maxStar === "number" && Number.isFinite(params.maxStar)) {
    const safeMaxStar = Math.floor(params.maxStar);
    if (safeMaxStar >= 1 && safeMaxStar <= 5) {
      cleanParams.maxStar = safeMaxStar;
    }
  }

  if (
    typeof cleanParams.minStar === "number" &&
    typeof cleanParams.maxStar === "number" &&
    cleanParams.maxStar < cleanParams.minStar
  ) {
    delete cleanParams.maxStar;
  }

  if (Array.isArray(params.tags)) {
    const safeTags = params.tags
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
    if (safeTags.length > 0) {
      cleanParams.tags = safeTags;
    }
  }

  if (typeof params.cityCode === "string" && params.cityCode.trim()) {
    cleanParams.cityCode = params.cityCode.trim();
  }

  const safeCheckIn = toIsoDateTime(params.checkIn);
  if (safeCheckIn) {
    cleanParams.checkIn = safeCheckIn;
  }

  const safeCheckOut = toIsoDateTime(params.checkOut);
  if (safeCheckOut) {
    cleanParams.checkOut = safeCheckOut;
  }

  if (
    typeof params.roomsNeeded === "number" &&
    Number.isFinite(params.roomsNeeded) &&
    params.roomsNeeded >= 1
  ) {
    cleanParams.roomsNeeded = Math.floor(params.roomsNeeded);
  }

  if (
    typeof params.peopleNeeded === "number" &&
    Number.isFinite(params.peopleNeeded) &&
    params.peopleNeeded >= 1
  ) {
    cleanParams.peopleNeeded = Math.floor(params.peopleNeeded);
  }

  if (typeof params.userLat === "number" && Number.isFinite(params.userLat)) {
    cleanParams.userLat = params.userLat;
  }

  if (typeof params.userLng === "number" && Number.isFinite(params.userLng)) {
    cleanParams.userLng = params.userLng;
  }

  if (typeof params.minScore === "number" && Number.isFinite(params.minScore)) {
    cleanParams.minScore = params.minScore;
  }

  if (params.sortBy === "distance" || params.sortBy === "price" || params.sortBy === "score") {
    cleanParams.sortBy = params.sortBy;
  }

  if (typeof params.page === "number" && Number.isFinite(params.page) && params.page >= 1) {
    cleanParams.page = Math.floor(params.page);
  }

  if (
    typeof params.pageSize === "number" &&
    Number.isFinite(params.pageSize) &&
    params.pageSize >= 1
  ) {
    cleanParams.pageSize = Math.floor(params.pageSize);
  }

  if (params.room?.tags || params.room?.facilities) {
    cleanParams.room = {
      tags: params.room?.tags,
      facilities: params.room?.facilities,
    };
  }

  const removeEmptyFields = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const compact = value
        .map((item) => removeEmptyFields(item))
        .filter((item) => item !== undefined && item !== null);
      return compact.length > 0 ? compact : undefined;
    }

    if (value && typeof value === "object") {
      const nextObject = Object.entries(value as Record<string, unknown>).reduce<
        Record<string, unknown>
      >((acc, [key, item]) => {
        const normalized = removeEmptyFields(item);
        if (normalized !== undefined && normalized !== null) {
          acc[key] = normalized;
        }
        return acc;
      }, {});

      return Object.keys(nextObject).length > 0 ? nextObject : undefined;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    }

    return value;
  };

  const requestBody = (removeEmptyFields(cleanParams) || {}) as SearchHotelsParams;

  const response = await Taro.request<SearchHotelsResponse>({
    url: `${API_BASE_URL}/hotels/search`,
    method: "POST",
    data: requestBody,
    header: {
      "content-type": "application/json",
    },
  });

  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data || { total: 0, data: [] };
  }

  throw new Error("获取酒店列表失败");
}

const normalizeDateParam = (value?: string) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseMaybeJsonArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch (error) {
      return [];
    }
  }
  return [];
};

const normalizeNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const normalizePictures = (room: Record<string, unknown>): string[] => {
  const candidates = [room.pictureUrl, room.picture_url, room.picture_urls];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const values = candidate
        .map((item) => normalizeString(item))
        .filter(Boolean) as string[];
      if (values.length > 0) return values;
    }
    if (typeof candidate === "string") {
      const parsed = parseMaybeJsonArray(candidate);
      if (parsed.length > 0) return parsed;
      const single = normalizeString(candidate);
      if (single) return [single];
    }
  }
  return [];
};

const normalizeRoom = (
  room: Record<string, unknown>,
  fallbackHotelId?: string | number,
): HotelRoomItem => {
  const id = normalizeNumber(room.id) || 0;
  const hotelIdValue =
    normalizeNumber(room.hotelId) ||
    normalizeNumber(room.hotel_id) ||
    normalizeNumber(fallbackHotelId) ||
    0;
  const price = normalizeNumber(room.price);
  const pictureUrls = normalizePictures(room);
  const areaTitle = normalizeString(room.areaTitle || room.area_title);
  const bedTitle = normalizeString(room.bedTitle || room.bed_title);
  const windowTitle = normalizeString(room.windowTitle || room.window_title);
  const smokeTitle = normalizeString(room.smokeTitle || room.smoke_title);
  const wifiInfo = normalizeString(room.wifiInfo || room.wifi_info);
  const floorTitle = normalizeString(room.floorTitle || room.floor_title);

  return {
    id,
    hotelId: hotelIdValue,
    name: normalizeString(room.name) || "",
    capacity: normalizeNumber(room.capacity),
    availableCount:
      normalizeNumber(room.availableCount) ||
      normalizeNumber(room.total_stock) ||
      normalizeNumber(room.availableCount) ||
      normalizeNumber(room.available_count),
    floorTitle,
    areaTitle,
    bedTitle,
    windowTitle,
    smokeTitle,
    wifiInfo,
    cleaningFacilities: parseMaybeJsonArray(
      room.cleaningFacilities || room.cleaning_facilities,
    ),
    bathingFacilities: parseMaybeJsonArray(
      room.bathingFacilities || room.bathing_facilities,
    ),
    layoutFacilities: parseMaybeJsonArray(
      room.layoutFacilities || room.layout_facilities,
    ),
    accessibleFacilities: parseMaybeJsonArray(
      room.accessibleFacilities || room.accessible_facilities,
    ),
    networkFacilities: parseMaybeJsonArray(
      room.networkFacilities || room.network_facilities,
    ),
    bathroomFacilities: parseMaybeJsonArray(
      room.bathroomFacilities || room.bathroom_facilities,
    ),
    foodFacilities: parseMaybeJsonArray(room.foodFacilities || room.food_facilities),
    childFacilities: parseMaybeJsonArray(room.childFacilities || room.child_facilities),
    mediaFacilities: parseMaybeJsonArray(
      room.mediaFacilities || room.media_facilities,
    ),
    roomSpecFacilities: parseMaybeJsonArray(
      room.roomSpecFacilities || room.room_spec_facilities,
    ),
    kitchenFacilities: parseMaybeJsonArray(
      room.kitchenFacilities || room.kitchen_facilities,
    ),
    amenityFacilities: parseMaybeJsonArray(
      room.amenityFacilities || room.amenity_facilities,
    ),
    viewFacilities: parseMaybeJsonArray(room.viewFacilities || room.view_facilities),
    pictureUrl: pictureUrls[0],
    price,
  };
};

export async function getHotelDetail(
  hotelId: string | number,
  checkIn?: string,
  checkOut?: string,
): Promise<HotelDetailItem> {
  const safeCheckIn = normalizeDateParam(checkIn);
  const safeCheckOut = normalizeDateParam(checkOut);
  const queryParams: string[] = [];

  if (safeCheckIn) {
    queryParams.push(`checkIn=${encodeURIComponent(safeCheckIn)}`);
  }
  if (safeCheckOut) {
    queryParams.push(`checkOut=${encodeURIComponent(safeCheckOut)}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  const response = await Taro.request<HotelDetailItem>({
    url: `${API_BASE_URL}/hotels/${hotelId}/detail${queryString}`,
    method: "GET",
  });

  if (response.statusCode >= 200 && response.statusCode < 300 && response.data) {
    return response.data;
  }

  throw new Error("获取酒店详情失败");
}

export async function searchRooms(
  params: SearchRoomsParams,
): Promise<SearchRoomsResponse> {
  const cleanParams: SearchRoomsParams = {
    hotelId: Math.floor(params.hotelId),
  };

  if (params.tags) {
    cleanParams.tags = params.tags;
  }

  if (params.facilities) {
    cleanParams.facilities = params.facilities;
  }

  const safeCheckIn = normalizeDateParam(params.checkIn);
  if (safeCheckIn) {
    cleanParams.checkIn = safeCheckIn;
  }

  const safeCheckOut = normalizeDateParam(params.checkOut);
  if (safeCheckOut) {
    cleanParams.checkOut = safeCheckOut;
  }

  if (
    typeof params.roomsNeeded === "number" &&
    Number.isFinite(params.roomsNeeded) &&
    params.roomsNeeded >= 1
  ) {
    cleanParams.roomsNeeded = Math.floor(params.roomsNeeded);
  }

  if (
    typeof params.peopleNeeded === "number" &&
    Number.isFinite(params.peopleNeeded) &&
    params.peopleNeeded >= 1
  ) {
    cleanParams.peopleNeeded = Math.floor(params.peopleNeeded);
  }

  if (typeof params.page === "number" && Number.isFinite(params.page) && params.page >= 1) {
    cleanParams.page = Math.floor(params.page);
  }

  if (
    typeof params.pageSize === "number" &&
    Number.isFinite(params.pageSize) &&
    params.pageSize >= 1
  ) {
    cleanParams.pageSize = Math.floor(params.pageSize);
  }

  const response = await Taro.request<SearchRoomsResponse>({
    url: `${API_BASE_URL}/rooms/search`,
    method: "POST",
    data: cleanParams,
    header: {
      "content-type": "application/json",
    },
  });

  if (response.statusCode >= 200 && response.statusCode < 300 && response.data) {
    const sourceRooms = Array.isArray(response.data.data)
      ? (response.data.data as Array<Record<string, unknown>>)
      : [];
    return {
      total:
        typeof response.data.total === "number"
          ? response.data.total
          : sourceRooms.length,
      data: sourceRooms.map((room) => normalizeRoom(room, params.hotelId)),
    };
  }

  throw new Error("获取房型列表失败");
}