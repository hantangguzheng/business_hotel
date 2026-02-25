import json, random, copy

beijing_locations = [
    "王府井", "西单", "三里屯", "国贸", "朝阳门", "东直门", "西直门",
    "中关村", "五道口", "海淀", "望京", "酒仙桥", "建国门", "崇文门",
    "宣武门", "鼓楼", "什刹海", "南锣鼓巷", "后海", "簋街", "东四",
    "西四", "方庄", "丰台", "石景山", "通州", "亦庄", "北苑", "双井", "四惠"
]

beijing_roads = [
    "长安街", "王府井大街", "西单北大街", "三里屯路", "建国路",
    "朝阳路", "东直门外大街", "北三环中路", "北四环西路", "中关村大街",
    "成府路", "知春路", "学院路", "望京西路", "阜成路", "复兴路",
    "西四环北路", "广渠路", "百子湾路", "双井南路", "劲松路",
    "潘家园路", "青年路", "酒仙桥路", "莲花池西路"
]

districts = ["朝阳区", "海淀区", "西城区", "东城区", "丰台区"]

def convert_hotel(hotel):
    h = copy.deepcopy(hotel)
    location = random.choice(beijing_locations)
    road = random.choice(beijing_roads)
    district = random.choice(districts)

    name_cn = h.get("nameCn", "")
    brand_cn = name_cn[:name_cn.index("(")] if "(" in name_cn else name_cn
    h["nameCn"] = f"{brand_cn}(北京{location}{road}店)"

    name_en = h.get("nameEn", "")
    brand_en = name_en[:name_en.index("(")] if "(" in name_en else name_en
    h["nameEn"] = f"{brand_en}(Beijing {location} {road})"

    h["address"] = f"北京市{district}{road}{random.randint(1, 200)}号"
    h["cityCode"] = "1"
    h["latitude"] = round(random.uniform(39.85, 40.02), 6)
    h["longitude"] = round(random.uniform(116.28, 116.52), 6)

    return h

with open("/Users/houyuxuan/Documents/project/hotel_backend/grab_data/hotel-insert/hotels3_cleaned.json", "r", encoding="utf-8") as f:
    hotels = json.load(f)

beijing_hotels = [convert_hotel(h) for h in hotels]

with open("/Users/houyuxuan/Documents/project/hotel_backend/grab_data/hotel-insert/bj_hotels3_cleaned.json", "w", encoding="utf-8") as f:
    json.dump(beijing_hotels, f, ensure_ascii=False, indent=2)

print(f"转换完成，共 {len(beijing_hotels)} 条")