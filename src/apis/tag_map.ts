import iconChargingPile from "../assets/icons/hotel-tag-charging-pile.svg";
import iconChessRoom from "../assets/icons/hotel-tag-chess-room.svg";
import iconCinemaRoom from "../assets/icons/hotel-tag-cinema-room.svg";
import iconCoffeeMachine from "../assets/icons/hotel-tag-coffee-machine.svg";
import iconDeliveryRobot from "../assets/icons/hotel-tag-delivery-robot.svg";
import iconDryer from "../assets/icons/hotel-tag-dryer.svg";
import iconFamilyRoom from "../assets/icons/hotel-tag-family-room.svg";
import iconFreeLaundry from "../assets/icons/hotel-tag-free-laundry.svg";
import iconFreeLuggage from "../assets/icons/hotel-tag-free-luggage.svg";
import iconFreeParking from "../assets/icons/hotel-tag-free-parking.svg";
import iconFreeWifi from "../assets/icons/hotel-tag-free-wifi.svg";
import iconGym from "../assets/icons/hotel-tag-gym.svg";
import iconHeating from "../assets/icons/hotel-tag-heating.svg";
import iconInstagrammable from "../assets/icons/hotel-tag-instagrammable.svg";
import iconKtv from "../assets/icons/hotel-tag-ktv.svg";
import iconLaundryRoom from "../assets/icons/hotel-tag-laundry-room.svg";
import iconMeetingHall from "../assets/icons/hotel-tag-meeting-hall.svg";
import iconMemberBenefits from "../assets/icons/hotel-tag-member-benefits.svg";
import iconNonSmokingFloor from "../assets/icons/hotel-tag-non-smoking-floor.svg";
import iconRobotService from "../assets/icons/hotel-tag-robot-service.svg";
import iconSelfCheckin from "../assets/icons/hotel-tag-self-checkin.svg";
import iconSmartControl from "../assets/icons/hotel-tag-smart-control.svg";
import iconSuite from "../assets/icons/hotel-tag-suite.svg";
import iconVintageStyle from "../assets/icons/hotel-tag-vintage-style.svg";

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

export const HOTEL_TAG_ICON_MAP: Record<
  HotelDbTag,
  { tag: HotelDbTag; icon: string }
> = {
  BUFFET_BREAKFAST: {
    tag: "BUFFET_BREAKFAST",
    icon: "",
  },
  BUTLER_SERVICE: {
    tag: "BUTLER_SERVICE",
    icon: "",
  },
  CHARGING_PILE: {
    tag: "CHARGING_PILE",
    icon: iconChargingPile,
  },
  CHESS_ROOM: {
    tag: "CHESS_ROOM",
    icon: iconChessRoom,
  },
  CINEMA_ROOM: {
    tag: "CINEMA_ROOM",
    icon: iconCinemaRoom,
  },
  COFFEE_MACHINE: {
    tag: "COFFEE_MACHINE",
    icon: iconCoffeeMachine,
  },
  DELIVERY_ROBOT: {
    tag: "DELIVERY_ROBOT",
    icon: iconDeliveryRobot,
  },
  DRYER: {
    tag: "DRYER",
    icon: iconDryer,
  },
  FAMILY_ROOM: {
    tag: "FAMILY_ROOM",
    icon: iconFamilyRoom,
  },
  FREE_LAUNDRY: {
    tag: "FREE_LAUNDRY",
    icon: iconFreeLaundry,
  },
  FREE_LUGGAGE: {
    tag: "FREE_LUGGAGE",
    icon: iconFreeLuggage,
  },
  FREE_PARKING: {
    tag: "FREE_PARKING",
    icon: iconFreeParking,
  },
  FREE_WIFI: {
    tag: "FREE_WIFI",
    icon: iconFreeWifi,
  },
  GYM: {
    tag: "GYM",
    icon: iconGym,
  },
  HEATING: {
    tag: "HEATING",
    icon: iconHeating,
  },
  INSTAGRAMMABLE: {
    tag: "INSTAGRAMMABLE",
    icon: iconInstagrammable,
  },
  KTV: {
    tag: "KTV",
    icon: iconKtv,
  },
  LAUNDRY_ROOM: {
    tag: "LAUNDRY_ROOM",
    icon: iconLaundryRoom,
  },
  MEETING_HALL: {
    tag: "MEETING_HALL",
    icon: iconMeetingHall,
  },
  MEMBER_BENEFITS: {
    tag: "MEMBER_BENEFITS",
    icon: iconMemberBenefits,
  },
  NON_SMOKING_FLOOR: {
    tag: "NON_SMOKING_FLOOR",
    icon: iconNonSmokingFloor,
  },
  ROBOT_SERVICE: {
    tag: "ROBOT_SERVICE",
    icon: iconRobotService,
  },
  SELF_CHECKIN: {
    tag: "SELF_CHECKIN",
    icon: iconSelfCheckin,
  },
  SMART_CONTROL: {
    tag: "SMART_CONTROL",
    icon: iconSmartControl,
  },
  SUITE: {
    tag: "SUITE",
    icon: iconSuite,
  },
  VINTAGE_STYLE: {
    tag: "VINTAGE_STYLE",
    icon: iconVintageStyle,
  },
};

export const HOTEL_CN_TO_DB_TAG_MAP: Record<string, HotelDbTag[]> = {
  免费WiFi: ["FREE_WIFI"],
  健身房: ["GYM"],
  免费停车: ["FREE_PARKING"],
  充电桩: ["CHARGING_PILE"],
  洗衣房: ["LAUNDRY_ROOM", "FREE_LAUNDRY"],
  免费洗衣: ["FREE_LAUNDRY"],
  机器人服务: ["ROBOT_SERVICE", "DELIVERY_ROBOT"],
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
    "TOOTHBRUSH",
    "TOOTHPASTE",
    "CONDITIONER",
    "SHOWER_GEL",
    "COMB",
    "RAZOR",
    "SOAP",
    "SHOWER_CAP",
    "SHAMPOO",
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
    "SLIPPERS",
    "SMART_TOILET",
    "BATHTUB",
    "HOT_WATER_24H",
    "TOWEL",
    "RAIN_SHOWER",
    "MIRROR",
    "BATH_TOWEL",
    "HAIR_DRYER",
    "PRIVATE_TOILET",
    "BATHROBE",
    "SHOWER",
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
    "BLACKOUT_CURTAINS",
    "DUCK_DOWN",
    "BLANKET",
    "EXTRA_LONG_BED",
    "SPARE_BEDDING",
    "AC",
    "AUTO_CURTAINS",
    "AIR_PURIFIER",
  ],
  kitchenFacilities: ["REFRIGERATOR"],
  amenityFacilities: [
    "VOLTAGE_220V",
    "BUTLER",
    "HANGERS",
    "SAFE_BOX",
    "SOCKET_MULTI",
    "SEWING_KIT",
    "TURN_DOWN",
    "UMBRELLA",
    "VOLTAGE_110V",
    "SCALE",
    "WELCOME_GIFT",
  ],
  viewFacilities: ["RIVER_VIEW", "LANDMARK_VIEW", "CITY_VIEW"],
};

export const ROOM_CN_TO_DB_TAG_MAP: Record<string, Partial<Record<RoomFacilityField, string[]>>> = {
  牙刷: { bathingFacilities: ["TOOTHBRUSH"] },
  牙膏: { bathingFacilities: ["TOOTHPASTE"] },
  沐浴露: { bathingFacilities: ["SHOWER_GEL"] },
  洗发水: { bathingFacilities: ["SHAMPOO"] },
  护发素: { bathingFacilities: ["CONDITIONER"] },
  香皂: { bathingFacilities: ["SOAP"] },
  浴帽: { bathingFacilities: ["SHOWER_CAP"] },
  梳子: { bathingFacilities: ["COMB"] },
  剃须刀: { bathingFacilities: ["RAZOR"] },

  每日打扫: { cleaningFacilities: ["DAILY_CLEANING"] },
  打扫工具: { cleaningFacilities: ["CLEANING_TOOLS"] },
  熨烫: { cleaningFacilities: ["IRONING"] },

  书桌: { layoutFacilities: ["DESK"] },
  茶几: { layoutFacilities: ["COFFEE_TABLE"] },
  休闲椅: { layoutFacilities: ["LOUNGE_CHAIR"] },
  装饰画: { layoutFacilities: ["DECORATIVE_PAINTING"] },

  客房WIFI: { networkFacilities: ["ROOM_WIFI"] },
  电话: { networkFacilities: ["TELEPHONE"] },
  国际直拨电话: { networkFacilities: ["INT_CALL"] },

  独立卫浴: { bathroomFacilities: ["PRIVATE_BATHROOM"] },
  独立卫生间: { bathroomFacilities: ["PRIVATE_TOILET"] },
  梳妆镜: { bathroomFacilities: ["MIRROR"] },
  毛巾: { bathroomFacilities: ["TOWEL"] },
  浴巾: { bathroomFacilities: ["BATH_TOWEL"] },
  "24小时热水": { bathroomFacilities: ["HOT_WATER_24H"] },
  拖鞋: { bathroomFacilities: ["SLIPPERS"], childFacilities: ["SLIPPERS"] },
  吹风机: { bathroomFacilities: ["HAIR_DRYER"] },
  淋浴: { bathroomFacilities: ["SHOWER"] },
  浴袍: { bathroomFacilities: ["BATHROBE"] },
  浴缸: { bathroomFacilities: ["BATHTUB"] },
  雨淋花洒喷头: { bathroomFacilities: ["RAIN_SHOWER"] },

  空调: { roomSpecFacilities: ["AC"] },
  自动窗帘: { roomSpecFacilities: ["AUTO_CURTAINS"] },
  遮光窗帘: { roomSpecFacilities: ["BLACKOUT_CURTAINS"] },
  "加长床 (>2m)": { roomSpecFacilities: ["EXTRA_LONG_BED"] },
  羽绒被: { roomSpecFacilities: ["DUCK_DOWN"] },
  毛毯: { roomSpecFacilities: ["BLANKET"] },
  备用床具: { roomSpecFacilities: ["SPARE_BEDDING"] },
  空气净化器: { roomSpecFacilities: ["AIR_PURIFIER"] },


  液晶电视: { mediaFacilities: ["LCD_TV"] },
  有线频道: { mediaFacilities: ["CABLE"] },
  智能门锁: { mediaFacilities: ["SMART_LOCK"] },
  智能客控: { mediaFacilities: ["SMART_CONTROL"] },

  衣架: { amenityFacilities: ["HANGERS"] },
  保险箱: { amenityFacilities: ["SAFE_BOX"] },
  管家服务: { amenityFacilities: ["BUTLER"] },
  雨伞: { amenityFacilities: ["UMBRELLA"] },
  欢迎礼遇: { amenityFacilities: ["WELCOME_GIFT"] },
  缝纫工具: { amenityFacilities: ["SEWING_KIT"] },
  夜床服务: { amenityFacilities: ["TURN_DOWN"] },
  "110V电压插座": { amenityFacilities: ["VOLTAGE_110V"] },
  "220V电压插座": { amenityFacilities: ["VOLTAGE_220V"] },
  体重秤: { amenityFacilities: ["SCALE"] },
  免费瓶装水: { foodFacilities: ["WATER"] },
  茶包: { foodFacilities: ["TEA_BAGS"] },
  热水壶: { foodFacilities: ["KETTLE"] },
  酒精饮品: { foodFacilities: ["ALCOHOL"] },
  软饮: { foodFacilities: ["SOFT_DRINK"] },
  水果: { foodFacilities: ["FRUIT"] },
  多功能插座: { amenityFacilities: ["SOCKET_MULTI"] },

  市景: { viewFacilities: ["CITY_VIEW"] },
  江景: { viewFacilities: ["RIVER_VIEW"] },
  智能马桶: { bathroomFacilities: ["SMART_TOILET"] },
  沙发: { layoutFacilities: ["SOFA"] },
  衣柜: { layoutFacilities: ["WARDROBE"] },
  无障碍设施: { accessibleFacilities: ["BATHTUB_HANDRAILS", "DOORBELL_PROMPT"] },
  迷你吧: { foodFacilities: ["MINI_BAR"] },
  冰箱: { kitchenFacilities: ["REFRIGERATOR"] },
  儿童床: { childFacilities: ["CRIB"] },
  儿童玩具: { childFacilities: ["TOYS"] },
  儿童洗漱用品: { childFacilities: ["TOILETRIES"] },
  儿童马桶座圈: { childFacilities: ["TOILET_SEAT"] },
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
