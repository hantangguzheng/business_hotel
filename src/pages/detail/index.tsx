import { Image, Map, Swiper, SwiperItem, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { ArrowRight, Check, Close, Location } from "@nutui/icons-react-taro";
import { useEffect, useMemo, useState } from "react";
import { Button, Calendar, Popup } from "@nutui/nutui-react-taro";
import { getHotelDetail } from "../../apis/hotels";
import type { HotelDetailItem } from "../../apis/type";
import { useSharedFilter } from "../../store/filter-context";
import { mapRoomTagValueToCn, mapTagToCn } from "../../apis/tag_map";
import GuestSelector from "../../components/guest-selector";
import "./index.scss";
import highlightIcon from "../../assets/imgs/highlight.svg";
import diamondIcon from "../../assets/imgs/diamond.svg";
const md5Module = require("../../utils/md5.js");
const md5: (input: string, key?: string, raw?: boolean) => string =
  typeof md5Module === "function" ? md5Module : md5Module?.default;

const QQ_MAP_KEY = "IPIBZ-U3CKJ-UYQFM-DZX2P-XR7J2-GABWR";
const QQ_MAP_SK = "eReOMGZUU9rMnVbYphtudUST6EfMC7MC";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x400/f0f2f5/999999&text=Hotel";

type NearbyItem = {
  title: string;
  subtitle: string;
  icon: string;
};

type NearbySection = {
  key: "traffic" | "sight" | "food";
  label: string;
  items: NearbyItem[];
};

type BookingState = {
  roomId: number;
  unitPrice: number;
};

const buildTencentSig = (
  path: string,
  params: Record<string, string | number>,
) => {
  const query = Object.keys(params)
    .filter(
      (key) =>
        key !== "sig" && params[key] !== undefined && params[key] !== null,
    )
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
  return md5(`${path}?${query}${QQ_MAP_SK}`);
};

const formatDistanceText = (distance: number) => {
  if (!Number.isFinite(distance) || distance <= 0) return "";
  if (distance >= 1000) {
    const kilometer =
      distance >= 10000
        ? (distance / 1000).toFixed(0)
        : (distance / 1000).toFixed(1);
    return `${kilometer}公里`;
  }
  return `${Math.round(distance)}米`;
};

const formatDurationText = (distance: number, preferDrive = false) => {
  if (!Number.isFinite(distance) || distance <= 0) return "";
  const shouldDrive = preferDrive || distance > 1200;
  const minute = shouldDrive
    ? Math.max(1, Math.round(distance / 400))
    : Math.max(1, Math.round(distance / 66));
  const way = shouldDrive ? "驾车" : "步行";
  return `${way}${formatDistanceText(distance)},约${minute}分钟`;
};

const getPoiIcon = (title: string) => {
  if (/机场/.test(title)) return "✈";
  if (/地铁|轻轨|高铁|火车|站/.test(title)) return "🚇";
  if (/广场|商场|商城/.test(title)) return "🏬";
  if (/景区|公园|博物馆|剧院|赛车场|景点/.test(title)) return "🧭";
  return "📍";
};

const buildDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const toValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    checkIn: toValue(today),
    checkOut: toValue(tomorrow),
  };
};

function DetailPage() {
  const { filter, setFilter } = useSharedFilter();
  const params = Taro.getCurrentInstance().router?.params || {};
  const defaultDates = useMemo(() => buildDefaultDates(), []);
  const [hotel, setHotel] = useState<HotelDetailItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoAddress, setGeoAddress] = useState("");
  const [, setNearbySections] = useState<NearbySection[]>([]);
  const [bookingState, setBookingState] = useState<BookingState | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [guestVisible, setGuestVisible] = useState(false);
  const [dateRange, setDateRange] = useState<string[]>([
    filter.checkIn || defaultDates.checkIn,
    filter.checkOut || defaultDates.checkOut,
  ]);
  const [guestRoomCount, setGuestRoomCount] = useState(
    Math.max(1, filter.roomCount || 1),
  );
  const [guestAdultCount, setGuestAdultCount] = useState(
    Math.max(1, filter.adultCount || 1),
  );
  const [guestChildCount, setGuestChildCount] = useState(
    Math.max(0, filter.childCount || 0),
  );
  const [selectedRoomTags, setSelectedRoomTags] = useState<string[]>([]);

  useEffect(() => {
    // const hotelId = params.id;
    const hotelId = 1;
    if (!hotelId) {
      Taro.showToast({
        title: "缺少酒店ID",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const detail = await getHotelDetail(
          hotelId,
          filter.checkIn || defaultDates.checkIn,
          filter.checkOut || defaultDates.checkOut,
        );
        setHotel(detail);
      } catch (error) {
        setHotel(null);
        Taro.showToast({
          title: "获取酒店详情失败",
          icon: "none",
          duration: 1500,
        });
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [
    defaultDates.checkIn,
    defaultDates.checkOut,
    filter.checkIn,
    filter.checkOut,
    params.id,
  ]);

  const centerLongitude =
    typeof hotel?.longitude === "number" ? hotel.longitude : 116.313972;
  const centerLatitude =
    typeof hotel?.latitude === "number" ? hotel.latitude : 39.980014;

  useEffect(() => {
    if (!hotel) return;
    if (
      typeof hotel.latitude !== "number" ||
      Number.isNaN(hotel.latitude) ||
      typeof hotel.longitude !== "number" ||
      Number.isNaN(hotel.longitude)
    ) {
      setGeoAddress(hotel.address || "");
      return;
    }

    const locationParam = `${hotel.latitude},${hotel.longitude}`;
    const geocoderData = {
      key: QQ_MAP_KEY,
      location: locationParam,
    };
    const sig = buildTencentSig("/ws/geocoder/v1", geocoderData);

    Taro.request({
      url: "https://apis.map.qq.com/ws/geocoder/v1",
      data: {
        ...geocoderData,
        sig,
      },
      success: (response) => {
        const result = response?.data?.result;
        const address =
          result?.formatted_addresses?.recommend ||
          result?.address ||
          hotel.address ||
          "";
        setGeoAddress(String(address));
      },
      fail: () => {
        setGeoAddress(hotel.address || "");
      },
    });
  }, [hotel]);

  useEffect(() => {
    if (!hotel) return;

    const searchNearby = (
      keyword: string,
      pageSize = 10,
      distance = 5000,
    ): Promise<{ items: any[]; count: number }> =>
      new Promise((resolve) => {
        const requestData: Record<string, string | number> = {
          keyword,
          boundary: `nearby(${centerLatitude},${centerLongitude},${distance},1)`,
          orderby: "_distance",
          page_size: pageSize,
          page_index: 1,
          output: "json",
          key: QQ_MAP_KEY,
        };

        requestData.sig = buildTencentSig("/ws/place/v1/search", requestData);

        Taro.request({
          url: "https://apis.map.qq.com/ws/place/v1/search",
          data: requestData,
          success: (response) => {
            const result = response?.data as any;
            if (result?.status !== 0) {
              resolve({ items: [], count: 0 });
              return;
            }
            const items = Array.isArray(result?.data) ? result.data : [];
            const count =
              typeof result?.count === "number" ? result.count : items.length;
            resolve({ items, count });
          },
          fail: () => resolve({ items: [], count: 0 }),
        });
      });

    const toNearbyItem = (item: any, preferDrive = false): NearbyItem => {
      const title = String(item?.title || item?.address || "暂无地点信息");
      const distanceNumber = Number(item?._distance || item?.distance || 0);
      const subtitle =
        formatDurationText(distanceNumber, preferDrive) ||
        String(item?.address || "暂无距离信息");
      return {
        title,
        subtitle,
        icon: getPoiIcon(title),
      };
    };

    const run = async () => {
      const [trafficRes, sightRes, foodRes, mallRes] = await Promise.all([
        searchNearby("地铁站", 10, 6000),
        searchNearby("景点", 10, 6000),
        searchNearby("餐饮", 20, 3000),
        searchNearby("商场", 10, 6000),
      ]);

      const trafficItems = trafficRes.items
        .slice(0, 4)
        .map((item) => toNearbyItem(item));
      const sightItems = sightRes.items
        .slice(0, 2)
        .map((item) => toNearbyItem(item));

      const mallItems = mallRes.items
        .slice(0, 2)
        .map((item) => toNearbyItem(item, true))
        .filter(
          (item, index, arr) =>
            arr.findIndex((current) => current.title === item.title) === index,
        );
      const diningItems = foodRes.items
        .slice(0, 2)
        .map((item) => toNearbyItem(item))
        .filter(
          (item, index, arr) =>
            arr.findIndex((current) => current.title === item.title) === index,
        );
      const foodItems = [...mallItems, ...diningItems].filter(
        (item, index, arr) =>
          arr.findIndex((current) => current.title === item.title) === index,
      );

      setNearbySections([
        {
          key: "traffic",
          label: "交通",
          items:
            trafficItems.length > 0
              ? trafficItems
              : [
                  {
                    title: "暂无交通信息",
                    subtitle: "可切换地图查看周边",
                    icon: "🚇",
                  },
                ],
        },
        {
          key: "sight",
          label: "景点",
          items:
            sightItems.length > 0
              ? sightItems
              : [
                  {
                    title: "暂无景点信息",
                    subtitle: "可切换地图查看周边",
                    icon: "🧭",
                  },
                ],
        },
        {
          key: "food",
          label: "逛吃",
          items:
            foodItems.length > 0
              ? foodItems
              : [
                  {
                    title: "暂无商圈信息",
                    subtitle: "可切换地图查看周边",
                    icon: "🏬",
                  },
                ],
        },
      ]);
    };

    void run();
  }, [centerLatitude, centerLongitude, hotel]);

  const markers = useMemo(
    () => [
      {
        id: 1,
        longitude: centerLongitude,
        latitude: centerLatitude,
        width: 24,
        height: 24,
        iconPath: hotel?.imageUrls?.[0] || FALLBACK_IMAGE,
      },
    ],
    [centerLatitude, centerLongitude, hotel?.imageUrls],
  );

  const hotelName = hotel?.nameCn || hotel?.nameEn || "酒店详情";
  const hotelAddress = geoAddress || "暂无地址信息";
  const hotelNear = hotel?.address || "暂无周边信息";
  const hotelImages =
    (hotel?.imageUrls || []).filter((item): item is string => Boolean(item))
      .length > 0
      ? (hotel?.imageUrls || []).filter((item): item is string => Boolean(item))
      : [FALLBACK_IMAGE];
  const hotelImage = hotelImages[0] || FALLBACK_IMAGE;
  const hotelRating =
    typeof hotel?.score === "number"
      ? hotel.score.toFixed(1)
      : typeof hotel?.starRating === "number"
        ? hotel.starRating.toFixed(1)
        : "--";
  const ratingNumber = Number(hotelRating);
  const ratingLevelText =
    Number.isFinite(ratingNumber) && ratingNumber >= 4.5
      ? "超棒"
      : Number.isFinite(ratingNumber) && ratingNumber >= 4
        ? "很好"
        : "不错";

  const hotelPrice =
    typeof hotel?.price === "number" && Number.isFinite(hotel.price)
      ? hotel.price
      : 0;
  const roomList = (hotel?.rooms || []).filter((room) => {
    if (typeof room.availableCount !== "number") return true;
    return room.availableCount > 0;
  });

  const getRoomTags = (room: (typeof roomList)[number]) =>
    [
      mapRoomTagValueToCn("areaTitles", room.areaTitle),
      mapRoomTagValueToCn("bedTitles", room.bedTitle),
      mapRoomTagValueToCn("window", room.windowTitle),
      mapRoomTagValueToCn("smoke", room.smokeTitle),
      mapRoomTagValueToCn("wifi", room.wifiInfo),
    ].filter(Boolean) as string[];

  const roomTagOptions = useMemo(
    () =>
      Array.from(new Set(roomList.flatMap((room) => getRoomTags(room)))).slice(
        0,
        20,
      ),
    [roomList],
  );

  const filteredRoomList = useMemo(() => {
    if (selectedRoomTags.length === 0) return roomList;
    return roomList.filter((room) => {
      const tags = getRoomTags(room);
      return selectedRoomTags.every((tag) => tags.includes(tag));
    });
  }, [roomList, selectedRoomTags]);
  const hotelTags = (hotel?.shortTags || []).map((tag) => mapTagToCn(tag));
  const starCount = Math.max(0, Math.floor(Number(hotel?.starRating || 0)));

  const formatMonthDay = (value?: string) => {
    if (!value) return "--";
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    return `${Number(parts[0])}/${Number(parts[1])}/${Number(parts[2])}`;
  };

  const stayDateText = `${formatMonthDay(filter.checkIn)} - ${formatMonthDay(filter.checkOut)}`;
  const stayRoomGuestText = `${Math.max(1, filter.roomCount)}间 ${Math.max(1, filter.adultCount)}成人 ${Math.max(0, filter.childCount)}儿童`;

  useEffect(() => {
    setDateRange([
      filter.checkIn || defaultDates.checkIn,
      filter.checkOut || defaultDates.checkOut,
    ]);
    setGuestRoomCount(Math.max(1, filter.roomCount || 1));
    setGuestAdultCount(Math.max(1, filter.adultCount || 1));
    setGuestChildCount(Math.max(0, filter.childCount || 0));
  }, [
    defaultDates.checkIn,
    defaultDates.checkOut,
    filter.adultCount,
    filter.checkIn,
    filter.checkOut,
    filter.childCount,
    filter.roomCount,
  ]);

  const calcNights = (checkInValue?: string, checkOutValue?: string) => {
    if (!checkInValue || !checkOutValue) return 1;
    const startTime = new Date(checkInValue.replace(/-/g, "/")).getTime();
    const endTime = new Date(checkOutValue.replace(/-/g, "/")).getTime();
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 1;
    const diff = endTime - startTime;
    if (diff <= 0) return 1;
    return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const nights = useMemo(
    () =>
      calcNights(
        filter.checkIn || defaultDates.checkIn,
        filter.checkOut || defaultDates.checkOut,
      ),
    [
      defaultDates.checkIn,
      defaultDates.checkOut,
      filter.checkIn,
      filter.checkOut,
    ],
  );

  const handleBookRoom = (roomId: number, roomPrice?: number) => {
    const unitPrice =
      typeof roomPrice === "number" && Number.isFinite(roomPrice)
        ? roomPrice
        : hotelPrice;
    setBookingState({
      roomId,
      unitPrice,
    });
  };

  const totalPrice = useMemo(() => {
    if (!bookingState) return 0;
    const roomCount = Math.max(1, Number(filter.roomCount || 1));
    return Math.round(bookingState.unitPrice * nights * roomCount);
  }, [bookingState, filter.roomCount, nights]);

  const normalizeDate = (value: any) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    const dateValue = typeof value === "number" ? new Date(value) : value;
    if (typeof dateValue.getFullYear !== "function") return "";
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const resolveRange = (param: any) => {
    if (Array.isArray(param) && Array.isArray(param[0])) {
      return [param[0][3], param[1][3]];
    }
    if (Array.isArray(param)) {
      return [param[0], param[1]];
    }
    if (Array.isArray(param?.value)) {
      return [param.value[0], param.value[1]];
    }
    return ["", ""];
  };

  const handleCalendarConfirm = (param: any) => {
    const [startRaw, endRaw] = resolveRange(param);
    const nextCheckIn = normalizeDate(startRaw);
    const nextCheckOut = normalizeDate(endRaw);
    if (!nextCheckIn || !nextCheckOut) {
      setCalendarVisible(false);
      return;
    }
    setDateRange([nextCheckIn, nextCheckOut]);
    setFilter({ checkIn: nextCheckIn, checkOut: nextCheckOut });
    setCalendarVisible(false);
  };

  const updateGuestCount = (
    next: number,
    min: number,
    max: number,
    setter: (value: number) => void,
  ) => {
    const safe = Math.min(max, Math.max(min, next));
    setter(safe);
  };

  const applyGuestSelection = () => {
    setFilter({
      roomCount: Math.max(1, guestRoomCount),
      adultCount: Math.max(1, guestAdultCount),
      childCount: Math.max(0, guestChildCount),
    });
    setGuestVisible(false);
  };

  const toggleRoomTag = (tag: string) => {
    setSelectedRoomTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  const openFullscreenMap = () => {
    Taro.openLocation({
      longitude: centerLongitude,
      latitude: centerLatitude,
      name: hotelName,
      address: hotelAddress,
      scale: 16,
    });
  };

  return (
    <View className="detail-page">
      <View className="detail-hero">
        <Swiper
          className="detail-hero__swiper"
          circular
          indicatorDots={hotelImages.length > 1}
          autoplay={false}
          duration={500}
        >
          {hotelImages.map((imageUrl, index) => (
            <SwiperItem key={`${imageUrl}-${index}`}>
              <Image
                className="detail-hero__image"
                src={imageUrl}
                mode="aspectFill"
              />
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      <View
        className="detail-card"
        style={{ paddingBottom: bookingState ? "120px" : "32px" }}
      >
        <View className="detail-title">
          <View className="detail-title__text">{hotelName}</View>
          <View className="detail-title__diamonds">
            {Array.from({ length: starCount }).map((_, index) => (
              <Image
                key={`detail-diamond-${index}`}
                className="detail-title__diamond"
                src={diamondIcon}
                mode="aspectFit"
              />
            ))}
          </View>
        </View>
        <View className="detail-subtitle">{hotel?.nameEn || ""}</View>
        <View className="detail-meta">
          <View className="detail-meta__rating-card">
            <View className="detail-meta__rating-head">
              <View className="detail-meta__rating-badge">{hotelRating}</View>
              <View className="detail-meta__rating-text">
                {ratingLevelText}
              </View>
            </View>
          </View>

          <View className="detail-meta__location-card">
            <Location width="18px" color="#196d4e" onClick={openFullscreenMap}/>

            <View className="detail-meta__location-subtitle">
              {hotelAddress}
            </View>
          </View>
        </View>

        <View className="detail-facilities-wrap">
          <View className="detail-facilities">
            {(hotelTags.length > 0 ? hotelTags : ["设施政策"])
              .slice(0, 6)
              .map((item) => (
                <View className="detail-facility" key={item}>
                  <View className="detail-facility__icon" />
                  <View className="detail-facility__label">{item}</View>
                </View>
              ))}
          </View>
          <View className="detail-facilities__more">
            <View className="detail-facilities__more-text">
              <View>酒店</View>
              <View>设施</View>
            </View>
            <ArrowRight width="14px" color="#6B7A90" />
          </View>
        </View>

        <View className="detail-stay-card">
          <View className="detail-stay-card__top">
            <View
              className="detail-stay-card__date"
              onClick={() => setCalendarVisible(true)}
            >
              {stayDateText}
            </View>
            <View
              className="detail-stay-card__guest"
              onClick={() => setGuestVisible(true)}
            >
              {stayRoomGuestText}
            </View>
          </View>
          <View className="detail-stay-card__tags-container">
            <View className="detail-stay-card__tags">
              {roomTagOptions.map((tag) => (
                <View
                  key={tag}
                  className={
                    selectedRoomTags.includes(tag)
                      ? "detail-room-tags__item is-active"
                      : "detail-room-tags__item"
                  }
                  onClick={() => toggleRoomTag(tag)}
                >
                  {tag}
                </View>
              ))}
            </View>
            <ArrowRight width="12px" color="#6B7A90" />
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-rooms">
            {filteredRoomList.map((room) => (
              <View className="detail-room" key={room.id}>
                <Image
                  className="detail-room__image"
                  src={room.pictureUrl || hotelImage}
                  mode="aspectFill"
                />
                <View className="detail-room__content">
                  <View className="detail-room__name">{room.name}</View>
                  <View className="detail-room__meta">
                    {[
                      mapRoomTagValueToCn("areaTitles", room.areaTitle),
                      mapRoomTagValueToCn("bedTitles", room.bedTitle),
                      mapRoomTagValueToCn("window", room.windowTitle),
                      mapRoomTagValueToCn("smoke", room.smokeTitle),
                      mapRoomTagValueToCn("wifi", room.wifiInfo),
                    ]
                      .filter(Boolean)
                      .join(" · ") || "暂无房型信息"}
                  </View>
                  <View className="detail-room__bottom">
                    <View className="detail-room__stock">
                      剩余 {room.availableCount ?? 0} 间
                    </View>
                    <View className="detail-room__actions">
                      <View className="detail-room__price">
                        ¥{room.price ?? hotelPrice}
                      </View>
                      <View
                        className={`detail-room__book ${bookingState?.roomId === room.id ? "is-active" : ""}`}
                        onClick={() => handleBookRoom(room.id, room.price)}
                      >
                        {bookingState?.roomId === room.id ? (
                          <Check width="12px" color="#ffffff" />
                        ) : (
                          "订"
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            {filteredRoomList.length === 0 ? (
              <View className="detail-empty">
                {loading ? "加载中..." : "暂无房型信息"}
              </View>
            ) : null}
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section__row">
            <View className="detail-section__title">位置周边</View>
            <View
              className="detail-section__action"
              onClick={openFullscreenMap}
            >
              打开地图
            </View>
          </View>
          <View className="detail-map-tabs">
            <View className="detail-map-tabs__item-title">
              <Image
                src={highlightIcon}
                className="detail-map-tabs__item-icon"
              ></Image>

              <View className="detail-map-tabs__item is-active">位置亮点</View>
            </View>

            <View className="detail-map-tabs__item">{hotelNear}</View>
          </View>
          <View className="detail-map-card">
            <View className="detail-map-card__container">
              <Map
                id="myMap"
                className="detail-map"
                markers={markers}
                longitude={centerLongitude}
                latitude={centerLatitude}
                scale={16}
                enableScroll={false}
                enableZoom={false}
                enableRotate={false}
                enableOverlooking={false}
                onTap={openFullscreenMap}
                onError={() => {}}
              />
              <View className="detail-map-marker-label">{hotelName}</View>
            </View>
          </View>
          {/* <View className="detail-nearby">
            {nearbySections.map((section) => (
              <View className="detail-nearby__section" key={section.key}>
                <View className="detail-nearby__label">{section.label}</View>
                <View className="detail-nearby__grid">
                  {section.items.map((item, index) => (
                    <View
                      className="detail-nearby__item"
                      key={`${section.key}-${item.title}-${index}`}
                    >
                      <View className="detail-nearby__item-title-row">
                        <View className="detail-nearby__item-icon">
                          {item.icon}
                        </View>
                        <View className="detail-nearby__item-title">
                          {item.title}
                        </View>
                      </View>
                      <View className="detail-nearby__item-subtitle">
                        {item.subtitle}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View> */}
        </View>
      </View>

      {bookingState ? (
        <View className="detail-footer">
          <View>
            <View className="detail-footer__label">总价</View>
            <View className="detail-footer__nights-and-price">
              <View className="detail-footer__price">¥{totalPrice}.00</View>
              <View className="detail-footer__nights">共{nights}晚</View>
            </View>
          </View>
          <View className="detail-footer__button">确定</View>
        </View>
      ) : null}

      <Calendar
        visible={calendarVisible}
        defaultValue={dateRange}
        type="range"
        onClose={() => setCalendarVisible(false)}
        onConfirm={handleCalendarConfirm}
      />

      <Popup
        visible={guestVisible}
        position="bottom"
        onClose={() => setGuestVisible(false)}
      >
        <View className="detail-guest-popup">
          <View className="detail-guest-popup__header">
            <View
              className="detail-guest-popup__close"
              onClick={() => setGuestVisible(false)}
            >
              <Close color="grey" width="12px" />
            </View>
            <View className="detail-guest-popup__title">
              选择客房和入住人数
            </View>
          </View>
          <View className="detail-guest-popup__tips">
            入住人数较多时，试试增加间数
          </View>
          <GuestSelector
            roomCount={guestRoomCount}
            adultCount={guestAdultCount}
            childCount={guestChildCount}
            onChangeRoom={(next) =>
              updateGuestCount(next, 1, 99, setGuestRoomCount)
            }
            onChangeAdult={(next) =>
              updateGuestCount(next, 1, 99, setGuestAdultCount)
            }
            onChangeChild={(next) =>
              updateGuestCount(next, 0, 99, setGuestChildCount)
            }
          />
          <Button
            className="detail-guest-popup__confirm"
            type="primary"
            onClick={applyGuestSelection}
          >
            完成
          </Button>
        </View>
      </Popup>
    </View>
  );
}

export default DetailPage;
