export const ROOM_FACILITY_FIELDS = [
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
] as const;

export type RoomFacilityField = (typeof ROOM_FACILITY_FIELDS)[number];

export const HOTEL_DB_TAGS = [
  "BUFFET_BREAKFAST",
  "BUTLER_SERVICE",
  "CHARGING_PILE",
  "CHESS_ROOM",
  "CINEMA_ROOM",
  "COFFEE_MACHINE",
  "DELIVERY_ROBOT",
  "DRYER",
  "FAMILY_ROOM",
  "FREE_LAUNDRY",
  "FREE_LUGGAGE",
  "FREE_PARKING",
  "FREE_WIFI",
  "GYM",
  "HEATING",
  "INSTAGRAMMABLE",
  "KTV",
  "LAUNDRY_ROOM",
  "MEETING_HALL",
  "MEMBER_BENEFITS",
  "NON_SMOKING_FLOOR",
  "ROBOT_SERVICE",
  "SELF_CHECKIN",
  "SMART_CONTROL",
  "SUITE",
  "VINTAGE_STYLE",
] as const;

export type HotelDbTag = (typeof HOTEL_DB_TAGS)[number];

export const HOTEL_CN_TO_DB_TAG_MAP: Record<string, HotelDbTag[]> = {
  免费WiFi: ["FREE_WIFI"],
  健身房: ["GYM"],
  免费停车: ["FREE_PARKING"],
  充电桩: ["CHARGING_PILE"],
  洗衣房: ["LAUNDRY_ROOM", "FREE_LAUNDRY"],
  免费洗衣: ["FREE_LAUNDRY"],
  机器人服务: ["ROBOT_SERVICE", "DELIVERY_ROBOT"],
  送物机器人: ["DELIVERY_ROBOT"],
  会议厅: ["MEETING_HALL"],
  家庭房: ["FAMILY_ROOM"],
  套房: ["SUITE"],
  行李寄存: ["FREE_LUGGAGE"],
  自助入住: ["SELF_CHECKIN"],
  无烟楼层: ["NON_SMOKING_FLOOR"],
  暖气: ["HEATING"],
  咖啡机: ["COFFEE_MACHINE"],
  烘干机: ["DRYER"],
  复古风: ["VINTAGE_STYLE"],
  网红打卡: ["INSTAGRAMMABLE"],
  KTV: ["KTV"],
  棋牌室: ["CHESS_ROOM"],
  影院房: ["CINEMA_ROOM"],
  自助早餐: ["BUFFET_BREAKFAST"],
  智能客控: ["SMART_CONTROL"],
  会员权益: ["MEMBER_BENEFITS"],
  管家服务: ["BUTLER_SERVICE"],
};

export const HOTEL_DB_TO_CN_TAG_MAP: Partial<Record<HotelDbTag, string>> =
  Object.entries(HOTEL_CN_TO_DB_TAG_MAP).reduce(
    (result, [cnName, dbTags]) => {
      dbTags.forEach((dbTag) => {
        if (!result[dbTag]) {
          result[dbTag] = cnName;
        }
      });
      return result;
    },
    {} as Partial<Record<HotelDbTag, string>>,
  );

export const ROOM_TAG_VALUE_MAP = {
  areaTitles: {
    "小于35m²": "less35",
    "20-25m²": "less35",
    "25-30m²": "less35",
    "35-50m²": "35-50",
    "50m²以上": "50above",
    "≥50m²": "50above",
    "≥30m²": "35-50",
},
  bedTitles: {
    单人床: "single",
    双床: "twin",
    双人床: "double",
    大床: "king",
    其他: "others",
  },
  window: {
    有窗: "y",
    无窗: "n",
  },
  smoke: {
    可吸烟: "y",
    禁烟: "n",
  },
  wifi: {
    有WIFI: "y",
    无WIFI: "n",
  },
} as const;

export const ROOM_DB_TAGS_BY_FIELD: Record<RoomFacilityField, string[]> = {
  cleaningFacilities: ["DAILY_CLEANING", "CLEANING_TOOLS", "IRONING"],
  bathingFacilities: [
    "BATHTUB",
    "RAIN_SHOWER",
    "SHOWER",
    "BATHROBE",
    "BATH_TOWEL",
    "TOWEL",
  ],
  layoutFacilities: [
    "DESK",
    "SOFA",
    "WARDROBE",
    "LOUNGE_CHAIR",
    "COFFEE_TABLE",
    "DECORATIVE_PAINTING",
  ],
  accessibleFacilities: ["BATHTUB_HANDRAILS", "DOORBELL_PROMPT"],
  networkFacilities: ["ROOM_WIFI", "TELEPHONE", "INT_CALL"],
  bathroomFacilities: [
    "PRIVATE_BATHROOM",
    "PRIVATE_TOILET",
    "SMART_TOILET",
    "HAIR_DRYER",
    "MIRROR",
    "HOT_WATER_24H",
    "SLIPPERS",
  ],
  foodFacilities: [
    "MINI_BAR",
    "SOFT_DRINK",
    "TEA_BAGS",
    "WATER",
    "FRUIT",
    "ALCOHOL",
    "KETTLE",
  ],
  childFacilities: ["CRIB", "TOYS", "SLIPPERS", "TOILETRIES", "TOILET_SEAT"],
  mediaFacilities: ["LCD_TV", "CABLE", "SMART_LOCK", "SMART_CONTROL"],
  roomSpecFacilities: [
    "AC",
    "AUTO_CURTAINS",
    "BLACKOUT_CURTAINS",
    "AIR_PURIFIER",
    "EXTRA_LONG_BED",
    "DUCK_DOWN",
    "BLANKET",
    "SPARE_BEDDING",
    "HANGERS",
    "SOCKET_MULTI",
    "SAFE_BOX",
    "SCALE",
    "SEWING_KIT",
    "TURN_DOWN",
    "UMBRELLA",
    "VOLTAGE_110V",
    "VOLTAGE_220V",
    "WELCOME_GIFT",
    "BUTLER",
  ],
  kitchenFacilities: ["REFRIGERATOR"],
  amenityFacilities: [
    "TOOTHBRUSH",
    "TOOTHPASTE",
    "SHOWER_GEL",
    "SHAMPOO",
    "CONDITIONER",
    "SOAP",
    "SHOWER_CAP",
    "COMB",
    "RAZOR",
    "TOILETRIES",
  ],
  viewFacilities: ["CITY_VIEW", "LANDMARK_VIEW", "RIVER_VIEW", "GARDEN_VIEW"],
};

export const LAYOUT_FACILITY_META = [
  {
    tag: "DESK",
    cn: "书桌 / 办公桌",
    description: "房间内提供的办公或书写区域",
  },
  {
    tag: "SOFA",
    cn: "沙发",
    description: "休息区的各类沙发座椅",
  },
  {
    tag: "WARDROBE",
    cn: "衣柜",
    description: "用于存放衣物的柜子",
  },
  {
    tag: "COFFEE_TABLE",
    cn: "茶几 / 咖啡桌",
    description: "通常摆放在沙发前的矮桌",
  },
  {
    tag: "LOUNGE_CHAIR",
    cn: "休闲椅 / 躺椅",
    description: "单人使用的舒适靠椅",
  },
  {
    tag: "DECORATIVE_PAINTING",
    cn: "装饰画",
    description: "墙面上的挂画、艺术装饰",
  },
] as const;

export const CHILD_FACILITY_META = [
  {
    tag: "CRIB",
    cn: "婴儿床",
    description: "可移动或固定的围栏婴儿床",
  },
  {
    tag: "TOYS",
    cn: "儿童玩具",
    description: "房间内提供的益智玩具或毛绒公仔",
  },
  {
    tag: "SLIPPERS",
    cn: "儿童拖鞋",
    description: "专为儿童设计的小尺寸一次性或防滑拖鞋",
  },
  {
    tag: "TOILETRIES",
    cn: "儿童洗漱用品",
    description: "包括儿童牙刷、牙膏、温和沐浴露等配套",
  },
  {
    tag: "TOILET_SEAT",
    cn: "儿童马桶座圈",
    description: "放置在成人马桶上的缩小版辅助座圈",
  },
] as const;

export const ROOM_SPEC_FACILITY_META = [
  {
    tag: "AC",
    cn: "空调",
    description: "指客房独立空调或中央空调控制",
  },
  {
    tag: "AUTO_CURTAINS",
    cn: "自动窗帘",
    description: "智能客控系统，可通过面板或语音控制开关",
  },
  {
    tag: "BLACKOUT_CURTAINS",
    cn: "遮光窗帘",
    description: "具有高度遮光效果的窗帘，适合白天休息",
  },
  {
    tag: "EXTRA_LONG_BED",
    cn: "加长床 (>2m)",
    description: "适合高大身材客人的加长尺寸睡床",
  },
  {
    tag: "DUCK_DOWN",
    cn: "鸭绒/羽绒被",
    description: "高品质羽绒填充物，强调保暖与舒适感",
  },
  {
    tag: "BLANKET",
    cn: "毛毯",
    description: "额外的保暖毯子",
  },
  {
    tag: "SPARE_BEDDING",
    cn: "备用床具",
    description: "柜内备用的被褥、枕头等",
  },
  {
    tag: "AIR_PURIFIER",
    cn: "空气净化器",
    description: "针对过敏体质或对空气质量有要求的客人",
  },
] as const;

export const ROOM_CN_TO_DB_TAG_MAP: Record<string, Partial<Record<RoomFacilityField, string[]>>> = {
  牙刷: { amenityFacilities: ["TOOTHBRUSH"] },
  牙膏: { amenityFacilities: ["TOOTHPASTE"] },
  沐浴露: { amenityFacilities: ["SHOWER_GEL"] },
  洗发露: { amenityFacilities: ["SHAMPOO"] },
  洗发水: { amenityFacilities: ["SHAMPOO"] },
  护发素: { amenityFacilities: ["CONDITIONER"] },
  香皂: { amenityFacilities: ["SOAP"] },
  浴帽: { amenityFacilities: ["SHOWER_CAP"] },
  梳子: { amenityFacilities: ["COMB"] },
  剃须刀: { amenityFacilities: ["RAZOR"] },

  每日打扫: { cleaningFacilities: ["DAILY_CLEANING"] },
  打扫工具: { cleaningFacilities: ["CLEANING_TOOLS"] },
  熨烫设备: { cleaningFacilities: ["IRONING"] },
  熨衣设备: { cleaningFacilities: ["IRONING"] },

  "衣柜/衣橱": { layoutFacilities: ["WARDROBE"] },
  办公桌: { layoutFacilities: ["DESK"] },
  书桌: { layoutFacilities: ["DESK"] },
  "书桌/办公桌": { layoutFacilities: ["DESK"] },
  茶几: { layoutFacilities: ["COFFEE_TABLE"] },
  咖啡桌: { layoutFacilities: ["COFFEE_TABLE"] },
  休闲椅: { layoutFacilities: ["LOUNGE_CHAIR"] },
  躺椅: { layoutFacilities: ["LOUNGE_CHAIR"] },
  装饰画: { layoutFacilities: ["DECORATIVE_PAINTING"] },

  客房WIFI: { networkFacilities: ["ROOM_WIFI"] },
  "房间内置 WiFi": { networkFacilities: ["ROOM_WIFI"] },
  房间内置WiFi: { networkFacilities: ["ROOM_WIFI"] },
  "客房WIFI (免费)": { networkFacilities: ["ROOM_WIFI"] },
  客房WIFI免费: { networkFacilities: ["ROOM_WIFI"] },
  电话: { networkFacilities: ["TELEPHONE"] },
  国际直拨电话: { networkFacilities: ["INT_CALL"] },

  私人浴室: { bathroomFacilities: ["PRIVATE_BATHROOM"] },
  独立卫浴: { bathroomFacilities: ["PRIVATE_BATHROOM"] },
  私人卫生间: { bathroomFacilities: ["PRIVATE_TOILET"] },
  独立卫生间: { bathroomFacilities: ["PRIVATE_TOILET"] },
  浴室化妆放大镜: { bathroomFacilities: ["MIRROR"] },
  梳妆镜: { bathroomFacilities: ["MIRROR"] },
  毛巾: { bathroomFacilities: ["TOWEL"] },
  浴巾: { bathroomFacilities: ["BATH_TOWEL"] },
  "24小时热水": { bathroomFacilities: ["HOT_WATER_24H"] },
  拖鞋: { bathroomFacilities: ["SLIPPERS"] },
  吹风机: { bathroomFacilities: ["HAIR_DRYER"] },
  淋浴: { bathroomFacilities: ["SHOWER"] },
  热带雨林花洒: { bathroomFacilities: ["RAIN_SHOWER"] },
  浴缸: { bathroomFacilities: ["BATHTUB"] },
  雨淋花洒喷头: { bathroomFacilities: ["RAIN_SHOWER"] },

  空调: { roomSpecFacilities: ["AC"] },
  自动窗帘: { roomSpecFacilities: ["AUTO_CURTAINS"] },
  手动窗帘: { roomSpecFacilities: ["AUTO_CURTAINS"] },
  遮光窗帘: { roomSpecFacilities: ["BLACKOUT_CURTAINS"] },
  "特长睡床(超过两米)": { roomSpecFacilities: ["EXTRA_LONG_BED"] },
  "加长床 (>2m)": { roomSpecFacilities: ["EXTRA_LONG_BED"] },
  鸭绒被: { roomSpecFacilities: ["DUCK_DOWN"] },
  羽绒被: { roomSpecFacilities: ["DUCK_DOWN"] },
  "鸭绒/羽绒被": { roomSpecFacilities: ["DUCK_DOWN"] },
  毛毯: { roomSpecFacilities: ["BLANKET"] },
  备用床具: { roomSpecFacilities: ["SPARE_BEDDING"] },
  空气净化器: { roomSpecFacilities: ["AIR_PURIFIER"] },

  液晶电视机: { mediaFacilities: ["LCD_TV"] },
  液晶电视: { mediaFacilities: ["LCD_TV"] },
  有线频道: { mediaFacilities: ["CABLE"] },
  有线电视: { mediaFacilities: ["CABLE"] },
  智能门锁: { mediaFacilities: ["SMART_LOCK"] },
  智能客控: { mediaFacilities: ["SMART_CONTROL"], roomSpecFacilities: ["SMART_CONTROL"] },

  衣架: { amenityFacilities: ["HANGERS"] },
  免费瓶装水: { foodFacilities: ["WATER"] },
  茶包: { foodFacilities: ["TEA_BAGS"] },
  软饮: { foodFacilities: ["SOFT_DRINK"] },
  欢迎水果: { foodFacilities: ["FRUIT"] },
  多种规格电源插座: { amenityFacilities: ["SOCKET_MULTI"] },
  多功能插座: { amenityFacilities: ["SOCKET_MULTI"] },
  熨衣服务: { cleaningFacilities: ["IRONING"] },

  市景: { viewFacilities: ["CITY_VIEW"] },
  江景: { viewFacilities: ["RIVER_VIEW"] },
  河景: { viewFacilities: ["RIVER_VIEW"] },
  "江景/河景": { viewFacilities: ["RIVER_VIEW"] },
  花园景观: { viewFacilities: ["GARDEN_VIEW"] },

  智能马桶: { bathroomFacilities: ["SMART_TOILET"] },
  沙发: { layoutFacilities: ["SOFA"] },
  衣柜: { layoutFacilities: ["WARDROBE"] },
  无障碍设施: { accessibleFacilities: ["BATHTUB_HANDRAILS", "DOORBELL_PROMPT"] },
  房间WiFi: { networkFacilities: ["ROOM_WIFI"] },
  电视: { mediaFacilities: ["LCD_TV", "CABLE"] },
  智能控制: { mediaFacilities: ["SMART_CONTROL"], roomSpecFacilities: ["SMART_CONTROL"] },
  迷你吧: { foodFacilities: ["MINI_BAR"] },
  冰箱: { kitchenFacilities: ["REFRIGERATOR"] },
  儿童床: { childFacilities: ["CRIB"] },
  儿童玩具: { childFacilities: ["TOYS"] },
  儿童拖鞋: { childFacilities: ["SLIPPERS"] },
  儿童洗漱用品: { childFacilities: ["TOILETRIES"] },
  儿童马桶座圈: { childFacilities: ["TOILET_SEAT"] },
  清洁服务: { cleaningFacilities: ["DAILY_CLEANING", "CLEANING_TOOLS"] },
  熨烫: { cleaningFacilities: ["IRONING"] },
  城景: { viewFacilities: ["CITY_VIEW"] },
  地标景观: { viewFacilities: ["LANDMARK_VIEW"] },
};

export const ROOM_DB_TO_CN_TAG_MAP: Record<string, string> =
  Object.entries(ROOM_CN_TO_DB_TAG_MAP).reduce(
    (result, [cnName, fieldMap]) => {
      Object.values(fieldMap || {}).forEach((dbTags) => {
        (dbTags || []).forEach((dbTag) => {
          if (!result[dbTag]) {
            result[dbTag] = cnName;
          }
        });
      });
      return result;
    },
    {} as Record<string, string>,
  );

export const ROOM_VALUE_DB_TO_CN_MAP = {
  areaTitles: Object.entries(ROOM_TAG_VALUE_MAP.areaTitles).reduce(
    (result, [cnName, dbValue]) => {
      if (!result[dbValue]) {
        result[dbValue] = cnName;
      }
      return result;
    },
    {} as Record<string, string>,
  ),
  bedTitles: Object.entries(ROOM_TAG_VALUE_MAP.bedTitles).reduce(
    (result, [cnName, dbValue]) => {
      if (!result[dbValue]) {
        result[dbValue] = cnName;
      }
      return result;
    },
    {} as Record<string, string>,
  ),
  window: Object.entries(ROOM_TAG_VALUE_MAP.window).reduce(
    (result, [cnName, dbValue]) => {
      if (!result[dbValue]) {
        result[dbValue] = cnName;
      }
      return result;
    },
    {} as Record<string, string>,
  ),
  smoke: Object.entries(ROOM_TAG_VALUE_MAP.smoke).reduce(
    (result, [cnName, dbValue]) => {
      if (!result[dbValue]) {
        result[dbValue] = cnName;
      }
      return result;
    },
    {} as Record<string, string>,
  ),
  wifi: Object.entries(ROOM_TAG_VALUE_MAP.wifi).reduce(
    (result, [cnName, dbValue]) => {
      if (!result[dbValue]) {
        result[dbValue] = cnName;
      }
      return result;
    },
    {} as Record<string, string>,
  ),
} as const;

export const mapTagToCn = (tag?: string) => {
  if (!tag) return "";
  return HOTEL_DB_TO_CN_TAG_MAP[tag as HotelDbTag] || ROOM_DB_TO_CN_TAG_MAP[tag] || tag;
};

export const mapRoomTagValueToCn = (
  field: keyof typeof ROOM_VALUE_DB_TO_CN_MAP,
  value?: string,
) => {
  if (!value) return "";
  return ROOM_VALUE_DB_TO_CN_MAP[field][value] || value;
};
