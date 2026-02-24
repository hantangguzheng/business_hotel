import type { CityCode, HotelTag } from "@/types/hotel"


export const cityCodeMapping:Record<CityCode, string> = {
    "1":"北京",
    "2":"上海",
}

export const hotelTagMapping:Record<HotelTag, string> = {
    'BUFFET_BREAKFAST': '自助早餐',
    'CHESS_ROOM': '棋牌室',
    'MEMBER_BENEFITS': '享会员权益',
    'CHARGING_PILE': '充电桩',
    'FREE_WIFI': '免费客房WiFi',
    'INSTAGRAMMABLE': '拍照出片',
    'GYM': '健身室',
    'BUTLER_SERVICE': '管家服务',
    'COFFEE_MACHINE': '咖啡机',
    'SELF_CHECKIN': '自助入住',
    'MEETING_HALL': '会议厅',
    'VINTAGE_STYLE': '复古风',
    'CINEMA_ROOM': '影音房',
    'ROBOT_SERVICE': '机器人服务',
    'SMART_CONTROL': '智能客控',
    'FAMILY_ROOM': '家庭房',
    'LAUNDRY_ROOM': '洗衣房',
    'FREE_LUGGAGE': '免费行李寄存',
    'FREE_PARKING': '免费停车',
    'DRYER': '干衣机',
    'KTV': 'KTV',
    'FREE_LAUNDRY': '免费洗衣服务',
    'SUITE': '套房',
    'HEATING': '全屋暖气',
    'DELIVERY_ROBOT': '送餐机器人',
    'NON_SMOKING_FLOOR': '无烟楼层',
}