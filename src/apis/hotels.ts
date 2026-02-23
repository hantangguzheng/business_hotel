import Taro from "@tarojs/taro";
import { RUNTIME_CONFIG } from "../../config/env";
import type {
  HotelDetailItem,
  SearchHotelsParams,
  SearchHotelsResponse,
} from "./type";

const API_BASE_URL = RUNTIME_CONFIG.apiBaseUrl || "http://localhost:3000";

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
    // console.log("搜索酒店请求成功，响应数据：", response.data);
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