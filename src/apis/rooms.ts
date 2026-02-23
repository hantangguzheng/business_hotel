import Taro from "@tarojs/taro";
import { RUNTIME_CONFIG } from "../../config/env";
import type {
  HotelRoomItem,
  PromotionItem,
  SearchRoomsParams,
  SearchRoomsResponse,
} from "./type";

const API_BASE_URL = RUNTIME_CONFIG.apiBaseUrl || "http://localhost:3000";

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
  const priceOriginal = normalizeNumber(room.priceOriginal || room.price_original);
  const priceDiscounted = normalizeNumber(
    room.priceDiscounted || room.price_discounted,
  );

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
    priceOriginal,
    priceDiscounted,
  };
};

const normalizePromotionItem = (item: unknown): PromotionItem | null => {
  if (!item || typeof item !== "object") return null;
  const source = item as Record<string, unknown>;

  const id = normalizeNumber(source.id);
  const hotelId =
    normalizeNumber(source.hotelId) || normalizeNumber(source.hotel_id);
  const promotionType = normalizeString(
    source.promotionType || source.promotion_type,
  );
  const startDate = normalizeString(source.startDate || source.start_date);
  const endDate = normalizeString(source.endDate || source.end_date);
  const discount = normalizeNumber(source.discount);

  if (!id || !hotelId || !promotionType || !startDate || !endDate) {
    return null;
  }

  return {
    id,
    hotelId,
    promotionType,
    discount,
    startDate,
    endDate,
  };
};

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

  if (
    typeof params.page === "number" &&
    Number.isFinite(params.page) &&
    params.page >= 1
  ) {
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
    const sourcePromotions = Array.isArray((response.data as any).promotions)
      ? ((response.data as any).promotions as unknown[])
      : [];
    const promotions = sourcePromotions
      .map((item) => normalizePromotionItem(item))
      .filter((item): item is PromotionItem => Boolean(item));

    return {
      total:
        typeof response.data.total === "number"
          ? response.data.total
          : sourceRooms.length,
      data: sourceRooms.map((room) => normalizeRoom(room, params.hotelId)),
      promotions,
    };
  }

  throw new Error("获取房型列表失败");
}
