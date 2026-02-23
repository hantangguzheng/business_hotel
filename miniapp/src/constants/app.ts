import { RUNTIME_CONFIG } from "./env";

export const CITY_STORAGE_KEY = "city_selected";
export const CITY_LOCATION_INFO_KEY = "city_location_info";
export const CITY_ADDRESS_KEY = "city_address";
export const MY_LOCATION_KEY = "__MY_LOCATION__";
export const LANG_STORAGE_KEY = "app_lang";
export const DEFAULT_LANG = "zh";

const RAW_QQ_MAP_BASE_URL = String(
  RUNTIME_CONFIG.qqMapBaseUrl || "https://apis.map.qq.com/ws",
).replace(/\/$/, "");

export const QQ_MAP_BASE_URL = /\/ws$/.test(RAW_QQ_MAP_BASE_URL)
  ? RAW_QQ_MAP_BASE_URL
  : `${RAW_QQ_MAP_BASE_URL}/ws`;

export const QQ_MAP_KEY = RUNTIME_CONFIG.qqMapKey || "";

export const QQ_MAP_SK = RUNTIME_CONFIG.qqMapSk || "";

export const DEFAULT_CITY_INFO = {
  name: "上海",
  cityCode: "2",
};

export const FALLBACK_HOTEL_IMAGE_URL =
  "https://dummyimage.com/600x400/f0f2f5/999999&text=Hotel";

export const QUICK_FILTER_TAGS = [
  "4.7分以上",
  "自助早餐",
  "新开业",
  "双床房",
  "自助入住",
  "暖气",
] as const;
