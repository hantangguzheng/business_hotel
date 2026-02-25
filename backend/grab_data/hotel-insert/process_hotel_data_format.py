#!/usr/bin/env python3
import json
import random
import sys
from datetime import date, timedelta
from pathlib import Path

TAG_MAP = {
    "自助早餐": "BUFFET_BREAKFAST",
    "棋牌室": "CHESS_ROOM",
    "享会员权益": "MEMBER_BENEFITS",
    "充电桩": "CHARGING_PILE",
    "免费客房WiFi": "FREE_WIFI",
    "拍照出片": "INSTAGRAMMABLE",
    "健身室": "GYM",
    "管家服务": "BUTLER_SERVICE",
    "咖啡机": "COFFEE_MACHINE",
    "自助入住": "SELF_CHECKIN",
    "会议厅": "MEETING_HALL",
    "复古风": "VINTAGE_STYLE",
    "影音房": "CINEMA_ROOM",
    "机器人服务": "ROBOT_SERVICE",
    "智能客控": "SMART_CONTROL",
    "家庭房": "FAMILY_ROOM",
    "洗衣房": "LAUNDRY_ROOM",
    "免费行李寄存": "FREE_LUGGAGE",
    "免费停车": "FREE_PARKING",
    "干衣机": "DRYER",
    "KTV": "KTV",
    "免费洗衣服务": "FREE_LAUNDRY",
    "套房": "SUITE",
    "全屋暖气": "HEATING",
    "送餐机器人": "DELIVERY_ROBOT",
    "无烟楼层": "NON_SMOKING_FLOOR",
}

OPENING_START = date(2015, 1, 1)
OPENING_END = date(2025, 12, 31)

def random_opening_iso():
    days = (OPENING_END - OPENING_START).days
    rnd = OPENING_START + timedelta(days=random.randint(0, days))
    return rnd.isoformat() + "T00:00:00Z"

def merge_images(raw):
    images = list(raw.get("imageUrls") or [])
    extra = raw.get("ctripImageUrl")
    if extra:
        images.append(extra)
    seen, merged = set(), []
    for url in images:
        if url and url not in seen:
            merged.append(url)
            seen.add(url)
    return merged

def map_tags(tags):
    result = []
    for tag in tags or []:
        mapped = TAG_MAP.get(tag.strip()) if isinstance(tag, str) else None
        if mapped:
            result.append(mapped)
    return result

def normalize(entry):
    return {
        "nameCn": entry["nameCn"],
        "nameEn": entry.get("nameEn") or entry["nameCn"],
        "address": entry["address"],
        "starRating": entry.get("starRating", 3),
        "openingDate": entry.get("openingDate") or random_opening_iso(),
        "cityCode": str(entry.get("cityCode", "")),
        "price": str(entry.get("price", "0")),
        "crossLinePrice": str(entry["crossLinePrice"]) if entry.get("crossLinePrice") else None,
        "currency": entry.get("currency", "RMB"),
        "score": float(entry["score"]) if entry.get("score") else None,
        "totalReviews": entry.get("totalReviews"),
        "shortTags": map_tags(entry.get("shortTags")),
        "imageUrls": merge_images(entry),
        "latitude": entry["latitude"],
        "longitude": entry["longitude"],
        "rooms": [],
    }

def main(src, dst):
    hotels = json.loads(Path(src).read_text(encoding="utf-8"))
    normalized = []
    for item in hotels:
        payload = normalize(item)
        payload = {k: v for k, v in payload.items() if v is not None}
        normalized.append(payload)
    Path(dst).write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"清洗完成：{len(normalized)} 条写入 {dst}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python normalize_hotels.py input.json output.json")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
