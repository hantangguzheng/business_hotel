import Taro from "@tarojs/taro";
import type { SearchHotelsParams, SearchHotelsResponse } from "./type";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.TARO_APP_API_BASE_URL) ||
  "http://localhost:3000";

export async function searchHotels(
  params: SearchHotelsParams,
): Promise<SearchHotelsResponse> {
  const cleanParams: Record<string, string | number | string[]> = {};

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

  if (Array.isArray(params.tags)) {
    const safeTags = params.tags
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
    if (safeTags.length > 0) {
      cleanParams.tags = safeTags;
    }
  }

  if (typeof params.checkIn === "string" && params.checkIn.trim()) {
    cleanParams.checkIn = params.checkIn.trim();
  }

  if (typeof params.checkOut === "string" && params.checkOut.trim()) {
    cleanParams.checkOut = params.checkOut.trim();
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

  const response = await Taro.request<SearchHotelsResponse>({
    url: `${API_BASE_URL}/hotels/search`,
    method: "GET",
    data: cleanParams,
    header: {
      "content-type": "application/json",
    },
  });

  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data || { total: 0, data: [] };
  }

  throw new Error("获取酒店列表失败");
}