#!/usr/bin/env python3
"""
Batch insert rooms via /hotels/:hotelId/rooms/from-url.

Usage:
    python room.batchinsert.py room_list.json --token "Bearer XXX" \
        --base-url http://localhost:3000 --hotel-ids 12,15

If --hotel-ids 未指定，则导入文件中的全部 room。token 也可以通过
环境变量 ROOM_IMPORT_TOKEN 传入。
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set

import requests


def load_rooms(path: Path) -> List[Dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        return [data]
    if not isinstance(data, list):
        raise ValueError("room JSON 必须是数组或对象")
    return data


def parse_allowed(raw: Optional[str]) -> Optional[Set[int]]:
    if not raw:
        return None
    allowed: Set[int] = set()
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        try:
            allowed.add(int(part))
        except ValueError:
            raise ValueError(f"hotelId '{part}' 不是数字")
    return allowed


def first_picture(picture_value: Any) -> str:
    if isinstance(picture_value, list):
        return picture_value[0] if picture_value else ""
    if picture_value is None:
        return ""
    return str(picture_value)


FACILITY_FIELDS: Sequence[str] = [
    "cleaningFacilities",
    "bathingFacilities",
    "layoutFacilities",
    "accessibleFacilities",
    "networkFacilities",
    "bathroomFacilities",
    "foodFacilities",
    "childFacilities",
    "mediaFacilities",
    "roomSpecFacilities",
    "kitchenFacilities",
    "amenityFacilities",
    "viewFacilities",
]


def build_payload(room: Dict[str, Any]) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "name": room.get("name", "未命名房型"),
        "areaTitle": room.get("areaTitle"),
        "bedTitle": room.get("bedTitle"),
        "windowTitle": room.get("windowTitle"),
        "floorTitle": room.get("floorTitle", ""),
        "smokeTitle": room.get("smokeTitle"),
        "wifiInfo": room.get("wifiInfo"),
        "pictureUrl": first_picture(room.get("pictureUrl")),
        "capacity": room.get("capacity", 2),
        "price": str(room.get("price", "0")),
        "totalStock": int(room.get("totalStock", 5)),
    }
    for field in FACILITY_FIELDS:
        value = room.get(field)
        if value is None:
            payload[field] = []
        else:
            payload[field] = value
    return payload


def request_insert(
    session: requests.Session, base_url: str, hotel_id: int, payload: Dict[str, Any]
) -> requests.Response:
    url = f"{base_url.rstrip('/')}/hotels/{hotel_id}/rooms/from-url"
    return session.post(url, json=payload, timeout=15)


def import_rooms(
    rooms: Iterable[Dict[str, Any]],
    allowed_hotels: Optional[Set[int]],
    token: str,
    base_url: str,
    delay: float,
) -> None:
    session = requests.Session()
    session.headers.update(
        {
            "Authorization": token,
            "Content-Type": "application/json",
        }
    )

    success = 0
    failed = 0
    for idx, room in enumerate(rooms, start=1):
        hotel_id_raw = room.get("hotelId")
        if hotel_id_raw is None:
            print(f"[{idx}] 跳过：hotelId 缺失 -> {hotel_id_raw}")
            failed += 1
            continue
        try:
            hotel_id = int(hotel_id_raw)
        except (TypeError, ValueError):
            print(f"[{idx}] 跳过：hotelId 无效 -> {hotel_id_raw}")
            failed += 1
            continue

        if allowed_hotels and hotel_id not in allowed_hotels:
            continue

        payload = build_payload(room)
        try:
            resp = request_insert(session, base_url, hotel_id, payload)
            if resp.ok:
                room_id = resp.json().get("id")
                print(f"[{idx}] ✅ hotel {hotel_id} room created -> {room_id}")
                success += 1
            else:
                print(
                    f"[{idx}] ❌ hotel {hotel_id} status={resp.status_code} body={resp.text}"
                )
                failed += 1
        except requests.RequestException as exc:
            print(f"[{idx}] ❌ hotel {hotel_id} 请求失败: {exc}")
            failed += 1

        if delay > 0:
            time.sleep(delay)

    print(f"完成：成功 {success} 条，失败 {failed} 条")


def main(argv: Optional[Sequence[str]] = None) -> None:
    parser = argparse.ArgumentParser(description="批量导入房型")
    parser.add_argument("json_path", help="清洗后的 room JSON 路径")
    parser.add_argument(
        "--token",
        help="Authorization Bearer token（可用 ROOM_IMPORT_TOKEN 环境变量代替）",
    )
    parser.add_argument(
        "--base-url", default="http://localhost:3000", help="API 基础地址"
    )
    parser.add_argument(
        "--hotel-ids",
        help="只导入这些 hotelId，多值用逗号分隔，例如 12,15,18",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.1,
        help="每次请求之间的间隔秒数，避免压测（默认 0.1）",
    )
    args = parser.parse_args(argv)

    token = args.token or os.environ.get("ROOM_IMPORT_TOKEN")
    if not token:
        print("错误：必须提供 Bearer token（--token 或 ROOM_IMPORT_TOKEN）")
        sys.exit(1)
    if not token.lower().startswith("bearer "):
        token = f"Bearer {token}"

    json_path = Path(args.json_path)
    if not json_path.exists():
        print(f"错误：文件不存在 {json_path}")
        sys.exit(1)

    allowed = parse_allowed(args.hotel_ids)
    rooms = load_rooms(json_path)
    print(f"读取 {len(rooms)} 条房型记录，准备导入...")
    import_rooms(rooms, allowed, token, args.base_url, args.delay)


if __name__ == "__main__":
    main()

#99 195
#上线