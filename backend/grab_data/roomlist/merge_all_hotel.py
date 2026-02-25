import json
output_path = '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/all_rooms.json'
input_paths = [
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-0.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-1.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-2.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-3.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-4.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-5.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-6.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-b7.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-b8.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-b9.json',
    '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-b10.json',
]
datas = []
for path in input_paths:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, dict):
            datas.append(data)
        else:
            datas.extend(data)

last_hotel_id = datas[0]['hotelId']
fixed_id = 1
for data in datas:
    hotelId = data['hotelId']
    if hotelId == last_hotel_id:
        data['hotelId'] = fixed_id
    else:
        last_hotel_id = hotelId
        fixed_id += 1
        data['hotelId'] = fixed_id

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(datas, f, ensure_ascii=False, indent=2)
