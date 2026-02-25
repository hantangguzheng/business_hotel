#!/usr/bin/env python3
"""
Normalize raw room data into CreateRoomDto compatible JSON.

Usage:
    python process_room.py input.json output.json
"""

import json
import math
import re
import sys
from pathlib import Path
from typing import Dict, List

DEFAULT_TOTAL_STOCK = 5

AREA_TITLES = ('less35', '35-50', '50above')
BED_TITLES = ('single', 'double', 'twin', 'king', 'others')
YN = ('y', 'n')

BATHING_MAP = {
    '牙刷': 'TOOTHBRUSH',
    '牙膏': 'TOOTHPASTE',
    '沐浴露': 'SHOWER_GEL',
    '洗发水': 'SHAMPOO',
    '护发素': 'CONDITIONER',
    '香皂': 'SOAP',
    '浴帽': 'SHOWER_CAP',
    '梳子': 'COMB',
    '剃须刀': 'RAZOR',
}

CLEANING_MAP = {
    '每日打扫': 'DAILY_CLEANING',
    '打扫工具': 'CLEANING_TOOLS',
    '熨烫设备': 'IRONING',
    '熨衣设备': 'IRONING',
}

LAYOUT_MAP = {
    '书桌': 'DESK',
    '沙发': 'SOFA',
    '衣柜/衣橱': 'WARDROBE',
}

NETWORK_MAP = {
    '客房WIFI': 'ROOM_WIFI',
    '客房WIFI (免费)': 'ROOM_WIFI',
    '客房WIFI免费': 'ROOM_WIFI',
    '电话': 'TELEPHONE',
}

BATHROOM_MAP = {
    '私人浴室': 'PRIVATE_BATHROOM',
    '私人卫生间': 'PRIVATE_TOILET',
    '吹风机': 'HAIR_DRYER',
    '淋浴': 'SHOWER',
    '浴室化妆放大镜': 'MIRROR',
    '毛巾': 'TOWEL',
    '浴巾': 'BATH_TOWEL',
    '24小时热水': 'HOT_WATER_24H',
    '拖鞋': 'SLIPPERS',
    '雨淋花洒喷头': 'RAIN_SHOWER',
}

ROOM_SPEC_MAP = {
    '空调': 'AC',
    '手动窗帘': 'AUTO_CURTAINS',
    '遮光窗帘': 'BLACKOUT_CURTAINS',
    '特长睡床(超过两米)': 'EXTRA_LONG_BED',
}

MEDIA_MAP = {
    '液晶电视机': 'LCD_TV',
    '有线频道': 'CABLE',
    '智能门锁': 'SMART_LOCK',
}

AMENITY_MAP = {
    '衣架': 'HANGERS',
    '多种规格电源插座': 'SOCKET_MULTI',
}

# Other groups currently without concrete mapping can still be represented as empty lists.
ALL_FACILITY_FIELDS = [
    'cleaningFacilities',
    'bathingFacilities',
    'layoutFacilities',
    'accessibleFacilities',
    'networkFacilities',
    'bathroomFacilities',
    'foodFacilities',
    'childFacilities',
    'mediaFacilities',
    'roomSpecFacilities',
    'kitchenFacilities',
    'amenityFacilities',
    'viewFacilities',
]

FACILITY_GROUPS = {
    '洗浴用品': ('bathingFacilities', BATHING_MAP),
    '清洁服务': ('cleaningFacilities', CLEANING_MAP),
    '客房布局和家具': ('layoutFacilities', LAYOUT_MAP),
    '网络与通讯': ('networkFacilities', NETWORK_MAP),
    '卫浴设施': ('bathroomFacilities', BATHROOM_MAP),
    '客房设施': ('roomSpecFacilities', ROOM_SPEC_MAP),
    '媒体科技': ('mediaFacilities', MEDIA_MAP),
    '便利设施': ('amenityFacilities', AMENITY_MAP),
}


def load_rooms(path: Path) -> List[Dict]:
    data = json.loads(path.read_text(encoding='utf-8'))
    if isinstance(data, dict):
        return [data]
    return data


def numeric_value(text: str) -> float:
    if not text:
        return math.nan
    m = re.search(r'([0-9]+(\.[0-9]+)?)', text)
    return float(m.group(1)) if m else math.nan


def map_area(title: str) -> str:
    val = numeric_value(title)
    if math.isnan(val):
        return AREA_TITLES[0]
    if val < 35:
        return 'less35'
    if val <= 50:
        return '35-50'
    return '50above'


def map_bed(title: str) -> str:
    text = title or ''
    if any(k in text for k in ('单人床', '单床')):
        return 'single'
    if '双床' in text or '2张' in text or '两张' in text:
        return 'twin'
    if '大床' in text or '1张1.' in text:
        return 'king'
    if '双人床' in text:
        return 'double'
    return 'others'


def map_yes_no(value: str, positive_keywords: List[str]) -> str:
    text = (value or '').lower()
    for kw in positive_keywords:
        if kw in text:
            return 'y'
    return 'n'


def map_window(title: str) -> str:
    text = title or ''
    if '无窗' in text or '暗窗' in text:
        return 'n'
    return 'y'


def map_smoke(title: str) -> str:
    text = title or ''
    if '禁' in text:
        return 'n'
    if '可吸烟' in text:
        return 'y'
    return 'n'


def map_wifi(info: str) -> str:
    text = (info or '').lower()
    if 'wi-fi' in text or 'wifi' in text:
        return 'y'
    return 'n'


def pick_price(entry: Dict) -> str:
    sale_list = entry.get('saleInfo') or entry.get('sale_pay_info')
    if sale_list and isinstance(sale_list, list):
        price = sale_list[0].get('price')
        if price is not None:
            return str(price)
    val = entry.get('price') or entry.get('minPrice')
    return str(val or 0)


def pick_capacity(entry: Dict) -> int:
    sale_list = entry.get('saleInfo') or entry.get('sale_pay_info')
    if sale_list and isinstance(sale_list, list):
        guests = sale_list[0].get('guestCount')
        if isinstance(guests, int) and guests > 0:
            return guests
    return 2


def map_facilities(entry: Dict) -> Dict[str, List[str]]:
    facilities = entry.get('facilities') or {}
    mapped: Dict[str, List[str]] = {}
    for group_cn, (field, dictionary) in FACILITY_GROUPS.items():
        values = []
        for item in facilities.get(group_cn, []):
            enum = dictionary.get(item)
            if enum:
                values.append(enum)
        if values:
            mapped[field] = values
    return mapped


def sanitize_floor(title: str) -> str:
    if not title:
        return ''
    digits = re.findall(r'\d+', title)
    return digits[0] if digits else title


def normalize_room(entry: Dict) -> Dict:
    pictures = entry.get('pictureUrl') or entry.get('pictures') or []
    if not isinstance(pictures, list):
        pictures = [str(pictures)]

    normalized = {
        'hotelId': entry.get('hotelId'),
        'name': entry.get('name') or f"房型{entry.get('id')}",
        'areaTitle': map_area(entry.get('areaTitle', '')),
        'bedTitle': map_bed(entry.get('bedTitle', '')),
        'windowTitle': map_window(entry.get('windowTitle', '')),
        'floorTitle': sanitize_floor(entry.get('floorTitle') or ''),
        'smokeTitle': map_smoke(entry.get('smokeTitle', '')),
        'wifiInfo': map_wifi(entry.get('wifiInfo', '')),
        'pictureUrl': pictures,
        'capacity': pick_capacity(entry),
        'price': pick_price(entry),
        'totalStock': entry.get('totalStock') or DEFAULT_TOTAL_STOCK,
    }
    normalized.update(map_facilities(entry))
    for field in ALL_FACILITY_FIELDS:
        normalized.setdefault(field, [])
    return normalized


def process_file(src: Path, dst: Path):
    rooms = load_rooms(src)
    cleaned = [normalize_room(room) for room in rooms]
    dst.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Processed {len(cleaned)} rooms -> {dst}")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python process_room.py <input.json> <output.json>')
        sys.exit(1)
    process_file(Path(sys.argv[1]), Path(sys.argv[2]))
    
