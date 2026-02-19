import json
input = '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/cleaned-room/bj_room.json'
outpt = '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/cleaned-room/bj_room.json'

with open(input, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    item['hotelId'] = item['hotelId'] + 98

with open(outpt, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
