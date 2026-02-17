#!/usr/bin/env python3
"""
批量调用 /api/merchant/hotels/from-url 创建酒店。

准备：
1. 先登录获取 access_token（MERCHANT 角色），并填入 TOKEN 常量或通过环境变量携带。
2. 把要导入的酒店列表放在 JSON 文件中，结构示例：
[
  {
    "id": "110386987",
    "nameCn": "...",
    "nameEn": "...",
    "imageUrls": ["https://...jpg"],
    "ctripImageUrl": "https://...jpg",
    "starRating": 2,
    "score": "4.6",
    "totalReviews": 1032,
    "price": 117.0,
    "crossLinePrice": 128.0,
    "currency": "RMB",
    "shortTags": ["送餐机器人", ...],
    "latitude": 31.24,
    "longitude": 121.40,
    "address": "...",
    "cityCode": "SHA"
  }
]
3. 在命令行运行：python import_hotels.py hotels.json 42
"""

import json
import sys
from pathlib import Path
import requests

API_BASE = "http://localhost:3000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInVzZXJuYW1lIjoiZXJpbiIsInJvbGUiOiJNRVJDSEFOVCIsImlhdCI6MTc3MTI0MzU5OCwiZXhwIjoxNzcxMjUwNzk4fQ.xvfwtI40mxwGAWpY1dWjlJpqKa0MUV2t8j7e9u8oy34"  # 或用 os.environ['TOKEN']

def merge_images(item):
    images = list(item.get("imageUrls") or [])
    ctrip = item.get("ctripImageUrl")
    if ctrip:
        images.append(ctrip)
    # 去重并保留顺序
    seen, merged = set(), []
    for url in images:
        if url and url not in seen:
            merged.append(url)
            seen.add(url)
    return merged

def build_payload(item, merchant_id):
    images = merge_images(item)
    return {
        "nameCn": item["nameCn"],
        "nameEn": item.get("nameEn") or item["nameCn"],
        "address": item["address"],
        "starRating": item.get("starRating", 3),
        "openingDate": item.get("openingDate", "2020-01-01"),
        "cityCode": str(item["cityCode"]),
        "price": item["price"],
        "crossLinePrice": item.get("crossLinePrice"),
        "currency": item.get("currency", "RMB"),
        "score": float(item.get("score", 0)) if item.get("score") else None,
        "totalReviews": item.get("totalReviews"),
        "shortTags": item.get("shortTags", []),
        "imageUrls": images,
        "latitude": item["latitude"],
        "longitude": item["longitude"],
        # rooms 可选，这里默认不带
        "rooms": []
    }

def main(json_path, merchant_id):
    hotels = json.loads(Path(json_path).read_text(encoding="utf-8"))
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    })
    url = f"{API_BASE}/api/merchant/hotels/from-url"
    for idx, hotel in enumerate(hotels, start=1):
        payload = build_payload(hotel, merchant_id)
        resp = session.post(url, json=payload)
        if resp.status_code == 201 or resp.status_code == 200:
            print(f"[{idx}] 成功创建 {hotel['nameCn']} -> ID {resp.json().get('id')}")
        else:
            print(f"[{idx}] 失败 {hotel['nameCn']} status={resp.status_code}: {resp.text}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python import_hotels.py <hotels.json> <merchantId>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
