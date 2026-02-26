import type { IRoomPayload } from "@/api/types/room"
import type {
    AccessibleFacility, AmenityFacility, AreaTitle, BathingFacility,
    BathroomFacility, BedTitle, ChildFacility, CleaningFacility, FoodFacility,
    KitchenFacility, LayoutFacility, MediaFacility, NetworkFacility,
    RoomSpecFacility, TwoOption, ViewFacility
} from "@/types/room"


export const bathingFacilityMapping: Record<BathingFacility, string> = {
    'TOOTHBRUSH': '牙刷',
    'TOOTHPASTE': '牙膏',
    'SHOWER_GEL': '沐浴露',
    'SHAMPOO': '洗发水',
    'CONDITIONER': '护发素',
    'SOAP': '香皂',
    'SHOWER_CAP': '浴帽',
    'COMB': '梳子',
    'RAZOR': '剃须刀',
}

export const cleaningFacilityMapping: Record<CleaningFacility, string> = {
    'DAILY_CLEANING': '每日打扫',
    'CLEANING_TOOLS': '打扫工具',
    'IRONING': '熨烫设备',
}

export const layoutFacilityMapping: Record<LayoutFacility, string> = {
    'DESK': '书桌',
    'SOFA': '沙发',
    'WARDROBE': '衣柜/衣橱',
    "LOUNGE_CHAIR": '休闲椅',
    "DECORATIVE_PAINTING": '挂墙装饰画/字画',
    "COFFEE_TABLE": '茶几',
}

export const networkFacilityMapping: Record<NetworkFacility, string> = {
    'ROOM_WIFI': '客房WIFI',
    'TELEPHONE': '电话',
    'INT_CALL': '客房有线宽带'
}

export const bathroomFacilityMapping: Record<BathroomFacility, string> = {
    'PRIVATE_BATHROOM': '私人浴室',
    'PRIVATE_TOILET': '私人卫生间',
    'HAIR_DRYER': '吹风机',
    'SHOWER': '淋浴',
    'MIRROR': '浴室化妆放大镜',
    'TOWEL': '毛巾',
    'BATH_TOWEL': '浴巾',
    'HOT_WATER_24H': '24小时热水',
    'SLIPPERS': '拖鞋',
    'RAIN_SHOWER': '雨淋花洒喷头',
    'SMART_TOILET': '智能马桶',
    'BATHTUB': '浴缸',
    'BATHROBE': '浴衣',
}

export const roomSpecFacilityMapping: Record<RoomSpecFacility, string> = {
    'AC': '空调',
    'AUTO_CURTAINS': '手动窗帘',
    'BLACKOUT_CURTAINS': '遮光窗帘',
    'EXTRA_LONG_BED': '特长睡床(超过两米)',
    'DUCK_DOWN': '床具：鸭绒被',
    'BLANKET': '床具：毯子或被子',
    'SPARE_BEDDING': '备用床具',
    'AIR_PURIFIER': '空气净化器',
}

export const mediaFacilityMapping: Record<MediaFacility, string> = {
    'LCD_TV': '液晶电视机',
    'CABLE': '有线频道',
    'SMART_LOCK': '智能门锁',
    'SMART_CONTROL': '智能客控',
}

export const amenityFacilityMapping: Record<AmenityFacility, string> = {
    'HANGERS': '衣架',
    'SOCKET_MULTI': '多种规格电源插座',
    'VOLTAGE_110V': '110V电压插座',
    'VOLTAGE_220V': '220V电压插座',
    'BUTLER': '管家服务',
    'UMBRELLA': '雨伞',
    'SAFE_BOX': '房内保险箱',
    'SEWING_KIT': '针线包',
    'WELCOME_GIFT': '欢迎礼品',
    'SCALE': '体重秤',
    'TURN_DOWN': '开夜床',
}

export const accessibleFacilityMapping: Record<AccessibleFacility, string> = {
    'DOORBELL_PROMPT': '门铃/电话提示',
    'BATHTUB_HANDRAILS': '无障碍淋浴',
}

export const childFacilityMapping: Record<ChildFacility, string> = {
    "TOYS": '儿童玩具',
    "TOILET_SEAT": '儿童防滑凳',
    "CRIB": '婴儿床',
    "SLIPPERS": '儿童拖鞋',
    "TOILETRIES": '儿童洗漱用品',
}

export const foodFacilityMapping: Record<FoodFacility, string> = {
    "KETTLE": '电热水壶',
    "TEA_BAGS": '茶包',
    "FRUIT": '水果',
    "WATER": '瓶装水',
    "MINI_BAR": '迷你吧',
    "SOFT_DRINK": '软饮',
    "ALCOHOL": '酒精饮料',
}

export const kitchenFacilityMapping: Record<KitchenFacility, string> = {
    "REFRIGERATOR": '冰箱',
}

export const viewFacilityMapping: Record<ViewFacility, string> = {
    "RIVER_VIEW": '河景',
    "LANDMARK_VIEW": '地标景',
    "CITY_VIEW": '城景',
}


export const areaTitleMapping: Record<AreaTitle, string> = {
    'less35': '小于35',
    '35-50': '35-50',
    '50above': '50以上'
};
export const bedTitleMapping: Record<BedTitle, string> = {
    'single': '单人床',
    'double': '双人床',
    'twin': '双单人床',
    'king': '双双人床',
    'others': '其他',
};
export const windowTitleMapping: Record<TwoOption, string>={
    'y':'有',
    'n':'无',
}
export const wifiTitleMapping: Record<TwoOption, string>={
    'y':'有',
    'n':'无',
}
export const smokeTitleMapping: Record<TwoOption, string>={
    'y':'可吸烟',
    'n':'禁烟',
}

export const facilityGroupLabels: Record<string, string> = {
  CleaningFacility: '清洁服务',//
  BathingFacility: '洗浴用品',//
  LayoutFacility: '客房布局和家具',//
  AccessibleFacility: '无障碍设施',//
  NetworkFacility: '网络与通讯设施',//
  BathroomFacility: '卫浴设施',//
  FoodFacility: '食品饮品',//
  ChildFacility: '儿童设施服务',//
  MediaFacility: '媒体科技',//
  RoomSpecFacility: '客房设施',//
  KitchenFacility: '厨房用品',//
  AmenityFacility: '便利设施',//
  ViewFacility: '室外景观',//
};

export const facilityFieldMap: Record<string, keyof IRoomPayload> = {
  CleaningFacility: 'cleaningFacilities',
  BathingFacility: 'bathingFacilities',
  LayoutFacility: 'layoutFacilities',
  AccessibleFacility: 'accessibleFacilities',
  NetworkFacility: 'networkFacilities',
  BathroomFacility: 'bathroomFacilities',
  FoodFacility: 'foodFacilities',
  ChildFacility: 'childFacilities',
  MediaFacility: 'mediaFacilities',
  RoomSpecFacility: 'roomSpecFacilities',
  KitchenFacility: 'kitchenFacilities',
  AmenityFacility: 'amenityFacilities',
  ViewFacility: 'viewFacilities',
};

export const facilityLabelMap: Record<keyof typeof facilityFieldMap, Record<string, string>> = {
  CleaningFacility: cleaningFacilityMapping,
  BathingFacility: bathingFacilityMapping,
  LayoutFacility: layoutFacilityMapping,
  AccessibleFacility: accessibleFacilityMapping,
  NetworkFacility: networkFacilityMapping,
  BathroomFacility: bathroomFacilityMapping,
  FoodFacility: foodFacilityMapping,
  ChildFacility: childFacilityMapping,
  MediaFacility: mediaFacilityMapping,
  RoomSpecFacility: roomSpecFacilityMapping,
  KitchenFacility: kitchenFacilityMapping,
  AmenityFacility: amenityFacilityMapping,
  ViewFacility: viewFacilityMapping,
}