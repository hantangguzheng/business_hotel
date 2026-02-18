# import json
# infile ='/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-0.json'
# ofile = '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/roomlist-test.json'
# with open(infile,'r') as inf:
#     data = json.load(inf)

# #data = data[70:100]

# with open(ofile,'w') as outf:
#     json.dump(data, outf, indent=4,ensure_ascii=False)


import json

with open('/Users/houyuxuan/Documents/project/hotel_backend/grab_data/roomlist/all_rooms.json','r') as inf:
    data = json.load(inf)

print(len(data))