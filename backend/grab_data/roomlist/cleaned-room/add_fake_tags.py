#!/usr/bin/env python3
"""
Add random fake facility tags to each room entry.

Default behavior:
    - load grab_data/roomlist/cleaned-room/room_list.json
    - normalize fields:
        * pictureUrl -> 只保留第一张
        * totalStock -> 5~10 的随机值
        * 各类 facility 字段填充随机枚举
    - 写回原文件（可通过 --output 另存）

Usage:
    python add_fake_tags.py
    python add_fake_tags.py --input rooms.json --output rooms_tagged.json --seed 42
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path
from typing import Dict, List, Sequence

DEFAULT_INPUT = Path(__file__).with_name("room_list.json")

TAG_POOLS: Dict[str, Sequence[str]] = {
    "cleaningFacilities": ["IRONING", "CLEANING_TOOLS", "DAILY_CLEANING"],
    "bathingFacilities": [
        "TOOTHBRUSH",
        "TOOTHPASTE",
        "CONDITIONER",
        "SHOWER_GEL",
        "COMB",
        "RAZOR",
        "SOAP",
        "SHOWER_CAP",
        "SHAMPOO",
    ],
    "layoutFacilities": [
        "LOUNGE_CHAIR",
        "SOFA",
        "DECORATIVE_PAINTING",
        "WARDROBE",
        "DESK",
        "COFFEE_TABLE",
    ],
    "accessibleFacilities": [
        "DOORBELL_PROMPT",
        "BATHTUB_HANDRAILS",
    ],
    "networkFacilities": [
        "TELEPHONE",
        "ROOM_WIFI",
        "INT_CALL",
    ],
    "bathroomFacilities": [
        "PRIVATE_BATHROOM",
        "SLIPPERS",
        "SMART_TOILET",
        "BATHTUB",
        "HOT_WATER_24H",
        "TOWEL",
        "RAIN_SHOWER",
        "MIRROR",
        "BATH_TOWEL",
        "HAIR_DRYER",
        "PRIVATE_TOILET",
        "BATHROBE",
        "SHOWER",
    ],
    "foodFacilities": [
        "KETTLE",
        "TEA_BAGS",
        "FRUIT",
        "WATER",
        "MINI_BAR",
        "SOFT_DRINK",
        "ALCOHOL",
    ],
    "childFacilities": [
        "TOYS",
        "TOILET_SEAT",
        "CRIB",
        "SLIPPERS",
        "TOILETRIES",
    ],
    "mediaFacilities": [
        "CABLE",
        "SMART_CONTROL",
        "LCD_TV",
        "SMART_LOCK",
    ],
    "roomSpecFacilities": [
        "BLACKOUT_CURTAINS",
        "DUCK_DOWN",
        "BLANKET",
        "EXTRA_LONG_BED",
        "SPARE_BEDDING",
        "AC",
        "AUTO_CURTAINS",
        "AIR_PURIFIER",
    ],
    "kitchenFacilities": [
        "REFRIGERATOR",
    ],
    "amenityFacilities": [
        "VOLTAGE_220V",
        "BUTLER",
        "HANGERS",
        "SAFE_BOX",
        "SOCKET_MULTI",
        "UMBRELLA",
        "WELCOME_GIFT",
        "SEWING_KIT",
        "TURN_DOWN",
        "VOLTAGE_110V",
        "SCALE",
    ],
    "viewFacilities": [
        "RIVER_VIEW",
        "LANDMARK_VIEW",
        "CITY_VIEW",
    ],
}


def random_subset(pool: Sequence[str]) -> List[str]:
    if not pool:
        return []
    count = random.randint(0, min(3, len(pool)))
    return random.sample(pool, count)


def ensure_picture(picture_value) -> str:
    if isinstance(picture_value, list):
        return picture_value[0] if picture_value else ""
    if picture_value is None:
        return ""
    return str(picture_value)


def dedupe_preserve(seq: Sequence[str]) -> List[str]:
    seen = set()
    result = []
    for item in seq:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def process_rooms(data: List[Dict]) -> List[Dict]:
    for room in data:
        room["pictureUrl"] = ensure_picture(room.get("pictureUrl"))
        room["totalStock"] = random.randint(5, 10)

        for field, pool in TAG_POOLS.items():
            existing = room.get(field) or []
            if not isinstance(existing, list):
                existing = [existing]
            allowed = set(pool)
            filtered = [tag for tag in existing if tag in allowed]
            combined = dedupe_preserve(filtered)
            combined.extend(tag for tag in random_subset(pool) if tag not in combined)
            room[field] = combined

    return data


def main():
    parser = argparse.ArgumentParser(description="Add fake facility tags to rooms")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--seed", type=int, help="Random seed for reproducibility")
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    rooms = json.loads(args.input.read_text(encoding="utf-8"))
    if not isinstance(rooms, list):
        raise ValueError("输入 JSON 必须是房型列表")

    updated = process_rooms(rooms)
    output_path = args.output or args.input
    output_path.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated {len(updated)} rooms -> {output_path}")


if __name__ == "__main__":
    main()
