import Taro from "@tarojs/taro";
import type { SearchHotelsParams, SearchHotelsResponse } from "./type";

const API_BASE_URL =
  process.env.TARO_APP_API_BASE_URL || "http://localhost:3000";

export async function searchHotels(
  params: SearchHotelsParams,
): Promise<SearchHotelsResponse> {
  const response = await Taro.request<SearchHotelsResponse>({
    url: `${API_BASE_URL}/hotels/search`,
    method: "GET",
    data: params,
    header: {
      "content-type": "application/json",
    },
  });

  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data || { total: 0, data: [] };
  }

  throw new Error("获取酒店列表失败");
}