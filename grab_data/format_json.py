import json
infile ='/Users/houyuxuan/Documents/project/hotel_backend/grab_data/hotel100filtered.json'
ofile = '/Users/houyuxuan/Documents/project/hotel_backend/grab_data/hotel-insert/hotels3.json'
with open(infile,'r') as inf:
    data = json.load(inf)

data = data[70:100]

with open(ofile,'w') as outf:
    json.dump(data, outf, indent=4,ensure_ascii=False)
