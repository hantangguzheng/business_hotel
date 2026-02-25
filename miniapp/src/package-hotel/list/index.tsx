import { Image, Input, ScrollView, View } from "@tarojs/components";
import Taro, { useDidShow, useReachBottom } from "@tarojs/taro";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  Calendar,
  Popup,
  SideNavBarItem,
} from "@nutui/nutui-react-taro";
import { ArrowDown, Close, Checked } from "@nutui/icons-react-taro";
import GuestSelector from "../../components/guest-selector";
import PriceStarPopup from "../../components/price-star-popup";
import HotelList from "./components/hotel-list";
import { useSharedFilter } from "../../store/filter-context";
import { searchHotels } from "../../apis/hotels";
import {
  CITY_ADDRESS_KEY,
  CITY_LOCATION_INFO_KEY,
  CITY_STORAGE_KEY,
  MY_LOCATION_KEY,
  QUICK_FILTER_TAGS,
  QQ_MAP_BASE_URL,
  QQ_MAP_KEY,
  QQ_MAP_SK,
} from "../../constants/app";
import {
  HOTEL_CN_TO_DB_TAG_MAP,
  ROOM_FACILITY_FIELDS,
  ROOM_CN_TO_DB_TAG_MAP,
  ROOM_TAG_VALUE_MAP,
} from "../../apis/tag_map";
import type { RoomFacilityField } from "../../apis/tag_map";
import type {
  HotelListItem,
  PromotionItem,
  SearchHotelsParams,
  SearchRoomFacilityFilters,
} from "../../apis/type";
import "./index.scss";
import mapIcon from "../../assets/imgs/map.svg";
const { cities } = require("../../utils/city");
const md5Module = require("../../utils/md5.js");
const md5: (input: string, key?: string, raw?: boolean) => string =
  typeof md5Module === "function" ? md5Module : md5Module?.default;

const DEFAULT_CITY = "上海";
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000000;
const DEFAULT_MIN_STAR = 2;
const DEFAULT_MAX_STAR = 5;
const PAGE_SIZE = 20;

type SortMode = "smart" | "distance" | "price" | "score";

const SORT_OPTIONS: Array<{ label: string; value: SortMode }> = [
  { label: "智能排序", value: "smart" },
  { label: "距离优先", value: "distance" },
  { label: "价格优先", value: "price" },
  { label: "评分优先", value: "score" },
];

const ROOM_FACILITY_FIELD_LABEL_MAP: Record<RoomFacilityField, string> = {
  cleaningFacilities: "清洁",
  bathingFacilities: "洗护",
  layoutFacilities: "布局",
  accessibleFacilities: "无障碍",
  networkFacilities: "网络",
  bathroomFacilities: "卫浴",
  foodFacilities: "餐饮",
  childFacilities: "儿童",
  mediaFacilities: "媒体",
  roomSpecFacilities: "房间配置",
  kitchenFacilities: "厨房",
  amenityFacilities: "便利设施",
  viewFacilities: "景观",
};

type QuickFilterChip = (typeof QUICK_FILTER_TAGS)[number];

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

const defaultDates = buildDefaultDates();

type CityOptionLite = {
  name: string;
  cityCode: string;
};

const collectCityOptions = () => {
  const groups = Object.keys(cities || {});
  const dedupe: Record<string, CityOptionLite> = {};

  groups.forEach((groupKey) => {
    const groupCities = cities[groupKey] || [];
    groupCities.forEach((item: any) => {
      const name = item?.name;
      if (!name || dedupe[name]) return;
      dedupe[name] = {
        name,
        cityCode: String(item?.cityCode || ""),
      };
    });
  });

  return Object.values(dedupe);
};

const ALL_CITY_OPTIONS = collectCityOptions();

const toFiniteNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function ListPage() {
  const params = Taro.getCurrentInstance().router?.params || {};
  const { filter, setFilter } = useSharedFilter();
  const {
    city,
    cityCode,
    keyword,
    checkIn,
    checkOut,
    roomCount,
    adultCount,
    childCount,
    userLat,
    userLng,
  } = filter;

  const decodeParam = (value?: string) => {
    if (!value) return "";
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return value;
    }
  };

  const normalizeParam = (value?: string) => {
    const decoded = decodeParam(value).trim();
    if (!decoded || decoded === "undefined" || decoded === "null") {
      return "";
    }
    return decoded;
  };

  const [filterVisible, setFilterVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [dateRange, setDateRange] = useState<string[]>([checkIn, checkOut]);
  const [activeFacilityTab, setActiveFacilityTab] = useState("酒店设施");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedStar, setSelectedStar] = useState(0);
  const [selectedMaxStar, setSelectedMaxStar] = useState<number | undefined>(
    undefined,
  );
  const [selectedMinPrice, setSelectedMinPrice] = useState<number | undefined>(
    undefined,
  );
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | undefined>(
    undefined,
  );
  const [priceStarVisible, setPriceStarVisible] = useState(false);
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTopAction, setActiveTopAction] = useState<
    "sort" | "priceStar" | "filter"
  >("sort");
  const [sortVisible, setSortVisible] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("smart");
  const [tripVisible, setTripVisible] = useState(false);
  const [guestVisible, setGuestVisible] = useState(false);
  const [tripCalendarVisible, setTripCalendarVisible] = useState(false);
  const [tripDraftCity, setTripDraftCity] = useState(city || DEFAULT_CITY);
  const [tripDraftCityCode, setTripDraftCityCode] = useState(cityCode || "");
  const [tripDraftCityLabel, setTripDraftCityLabel] = useState(
    city || DEFAULT_CITY,
  );
  const [tripDraftDateRange, setTripDraftDateRange] = useState<string[]>([
    checkIn || defaultDates.checkIn,
    checkOut || defaultDates.checkOut,
  ]);
  const [tripDraftRoomCount, setTripDraftRoomCount] = useState(roomCount || 1);
  const [tripDraftAdultCount, setTripDraftAdultCount] = useState(
    adultCount || 1,
  );
  const [tripDraftChildCount, setTripDraftChildCount] = useState(
    childCount || 0,
  );
  const [pendingTripCityPick, setPendingTripCityPick] = useState(false);
  const [topLocationLabel, setTopLocationLabel] = useState(
    city || DEFAULT_CITY,
  );
  const [isMyLocationMode, setIsMyLocationMode] = useState(false);
  const [activeQuickChips, setActiveQuickChips] = useState<QuickFilterChip[]>(
    [],
  );

  const reachBottomLastRef = useRef<number>(0);
  const REACH_BOTTOM_THROTTLE_MS = 800;

  const parseStoredCityInfo = (storedValue: unknown) => {
    if (!storedValue) return null;

    if (typeof storedValue === "string") {
      if (storedValue === "__MY_LOCATION__") return null;
      return { name: storedValue, cityCode: "" };
    }

    if (typeof storedValue === "object") {
      const maybeCity = storedValue as { name?: string; cityCode?: string };
      if (!maybeCity?.name) return null;
      return {
        name: maybeCity.name,
        cityCode: String(maybeCity.cityCode || ""),
      };
    }

    return null;
  };

  const resolveCityInfoByName = (name?: string): CityOptionLite | undefined => {
    if (!name) return undefined;
    const normalizedName = name.replace(/市$/, "").trim();
    const matched = ALL_CITY_OPTIONS.find((item) => {
      const optionName = String(item.name || "")
        .replace(/市$/, "")
        .trim();
      return optionName === normalizedName;
    });
    if (!matched) return undefined;
    return matched;
  };

  const normalizeLocationAddress = (value?: string) => {
    const text = String(value || "").trim();
    return text.replace(/^我的位置[：:]\s*/, "");
  };

  const resolveTripCityDraft = () => {
    const storedCity = Taro.getStorageSync(CITY_STORAGE_KEY);

    if (storedCity === MY_LOCATION_KEY) {
      const locationCityInfo = parseStoredCityInfo(
        Taro.getStorageSync(CITY_LOCATION_INFO_KEY),
      );
      const locationAddress = normalizeLocationAddress(
        Taro.getStorageSync(CITY_ADDRESS_KEY),
      );
      return {
        city: locationCityInfo?.name || city || DEFAULT_CITY,
        cityCode: locationCityInfo?.cityCode || cityCode || "",
        topLabel: "我的位置",
        tripLabel: locationAddress || "我的位置",
        isMyLocation: true,
      };
    }

    const storedCityInfo = parseStoredCityInfo(storedCity);
    if (storedCityInfo?.name) {
      return {
        city: storedCityInfo.name,
        cityCode: storedCityInfo.cityCode,
        topLabel: storedCityInfo.name,
        tripLabel: storedCityInfo.name,
        isMyLocation: false,
      };
    }

    return {
      city: city || DEFAULT_CITY,
      cityCode: cityCode || "",
      topLabel: city || DEFAULT_CITY,
      tripLabel: city || DEFAULT_CITY,
      isMyLocation: false,
    };
  };

  useDidShow(() => {
    const nextDraft = resolveTripCityDraft();
    setTopLocationLabel(nextDraft.topLabel);
    setIsMyLocationMode(nextDraft.isMyLocation);

    if (pendingTripCityPick) {
      setTripDraftCity(nextDraft.city);
      setTripDraftCityCode(nextDraft.cityCode);
      setTripDraftCityLabel(nextDraft.tripLabel);

      setTripVisible(true);
      setSortVisible(false);
      setTripCalendarVisible(false);
      setGuestVisible(false);
      setPendingTripCityPick(false);
    }
  });

  useEffect(() => {
    const nextTitle = String(city || "").trim();

    if (!nextTitle) return;
    Taro.setNavigationBarTitle({
      title: nextTitle,
    });
  }, [city]);

  useEffect(() => {
    const nextKeyword = normalizeParam(params.keyword);
    const nextQuickTag = normalizeParam(params.quickTag);
    const nextCity = normalizeParam(params.city);
    const nextCityCode = normalizeParam(params.cityCode);
    const nextCheckIn = normalizeParam(params.checkIn);
    const nextCheckOut = normalizeParam(params.checkOut);
    const nextMinPrice = Number(normalizeParam(params.minPrice));
    const nextMaxPrice = Number(normalizeParam(params.maxPrice));
    const nextMinStar = Number(normalizeParam(params.minStar));
    const nextMaxStar = Number(normalizeParam(params.maxStar));
    const nextRoomsNeeded = Number(normalizeParam(params.roomsNeeded));
    const nextPeopleNeeded = Number(normalizeParam(params.peopleNeeded));
    const nextRoomCount = Number(params.room) || nextRoomsNeeded || 1;
    const nextAdultCount =
      Number(params.adult) ||
      (Number.isFinite(nextPeopleNeeded) && nextPeopleNeeded > 0
        ? nextPeopleNeeded
        : 1);
    const nextChildCount = Number(params.child) || 0;

    setFilter({
      keyword: nextKeyword || keyword,
      city: nextCity || city || DEFAULT_CITY,
      cityCode: nextCityCode || cityCode,
      checkIn: nextCheckIn || checkIn || defaultDates.checkIn,
      checkOut: nextCheckOut || checkOut || defaultDates.checkOut,
      roomCount: nextRoomCount,
      adultCount: nextAdultCount,
      childCount: nextChildCount,
    });

    if (!Number.isNaN(nextMinPrice) && nextMinPrice > 0) {
      setSelectedMinPrice(nextMinPrice);
    }
    if (!Number.isNaN(nextMaxPrice) && nextMaxPrice > 0) {
      setSelectedMaxPrice(nextMaxPrice);
    }
    if (!Number.isNaN(nextMinStar) && nextMinStar > 0) {
      setSelectedStar(nextMinStar);
    }
    if (!Number.isNaN(nextMaxStar) && nextMaxStar > 0) {
      setSelectedMaxStar(nextMaxStar);
    }

    if (
      nextQuickTag &&
      QUICK_FILTER_TAGS.includes(nextQuickTag as QuickFilterChip)
    ) {
      setActiveQuickChips([nextQuickTag as QuickFilterChip]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildHotelTagGroups = () => {
    const selectedSet = new Set(selectedFacilities);
    const hasQuickBuffet = activeQuickChips.includes("自助早餐");
    const hasQuickSelfCheckin = activeQuickChips.includes("自助入住");
    const hasQuickHeating = activeQuickChips.includes("暖气");

    const selectedHotelLabels = Array.from(
      new Set([
        ...Object.keys(HOTEL_CN_TO_DB_TAG_MAP).filter((label) =>
          selectedSet.has(label),
        ),
        ...(hasQuickBuffet ? ["自助早餐"] : []),
        ...(hasQuickSelfCheckin ? ["自助入住"] : []),
        ...(hasQuickHeating ? ["暖气"] : []),
      ]),
    );

    return selectedHotelLabels
      .map((label) =>
        Array.from(new Set(HOTEL_CN_TO_DB_TAG_MAP[label] || [])).filter(
          Boolean,
        ),
      )
      .filter((group) => group.length > 0);
  };

  const buildHotelTagVariants = (tagGroups: string[][]) => {
    if (tagGroups.length === 0) return [] as string[][];

    const cartesian = tagGroups.reduce<string[][]>(
      (current, group) =>
        current.flatMap((picked) => group.map((tag) => [...picked, tag])),
      [[]],
    );

    const uniqueMap = new Map<string, string[]>();
    cartesian.forEach((tags) => {
      const normalized = Array.from(new Set(tags));
      const key = normalized.join("|");
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, normalized);
      }
    });

    return Array.from(uniqueMap.values());
  };

  const buildSearchHotelsParams = (
    page: number,
    overrideHotelTags?: string[],
  ): SearchHotelsParams => {
    const keywordValue = keyword.trim();
    const safeRoomCount = roomCount > 0 ? roomCount : 1;
    const safeAdultCount = adultCount > 0 ? adultCount : 1;
    const safeChildCount = childCount >= 0 ? childCount : 0;
    const peopleNeeded = safeAdultCount + safeChildCount;

    const selectedSet = new Set(selectedFacilities);
    const hasQuickHighScore = activeQuickChips.includes("4.7分以上");
    const hasQuickTwinBed = activeQuickChips.includes("双床房");
    const hasQuickNewOpen = activeQuickChips.includes("新开业");

    const roomLabels = facilityMap.客房设施 || [];
    const areaLabels = facilityMap.房间面积 || [];
    const scoreLabels = facilityMap.评分 || [];

    const hotelTagGroups = buildHotelTagGroups();
    const hotelTags =
      overrideHotelTags && overrideHotelTags.length > 0
        ? overrideHotelTags
        : Array.from(new Set(hotelTagGroups.flat()));

    const areaTitles = Array.from(
      new Set(
        areaLabels
          .filter((label) => selectedSet.has(label))
          .map((label) => ROOM_TAG_VALUE_MAP.areaTitles[label])
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const minScoreBySelection = scoreLabels.reduce<number | undefined>(
      (current, label) => {
        if (!selectedSet.has(label)) return current;
        const scoreValue = Number(label.replace("以上", ""));
        if (!Number.isFinite(scoreValue)) return current;
        if (typeof current !== "number") return scoreValue;
        return Math.max(current, scoreValue);
      },
      undefined,
    );

    const minScore = hasQuickHighScore
      ? Math.max(minScoreBySelection || 0, 4.7)
      : minScoreBySelection;

    const bedTitles = hasQuickTwinBed
      ? [ROOM_TAG_VALUE_MAP.bedTitles["双床"]]
      : [];

    const roomFacilities: SearchRoomFacilityFilters = {};
    roomLabels
      .filter((label) => selectedSet.has(label))
      .forEach((label) => {
        const mappedFields = ROOM_CN_TO_DB_TAG_MAP[label];
        if (!mappedFields) return;

        (
          Object.keys(mappedFields) as (keyof SearchRoomFacilityFilters)[]
        ).forEach((field) => {
          const nextValues = mappedFields[field] || [];
          if (nextValues.length === 0) return;
          const existing = roomFacilities[field] || [];
          roomFacilities[field] = Array.from(
            new Set([...existing, ...nextValues]),
          );
        });
      });

    const hasRoomFacilities = Object.keys(roomFacilities).length > 0;
    const hasRoomTags = areaTitles.length > 0 || bedTitles.length > 0;
    const safeMinPrice =
      typeof selectedMinPrice === "number"
        ? selectedMinPrice
        : DEFAULT_MIN_PRICE;
    const safeMaxPrice =
      typeof selectedMaxPrice === "number"
        ? selectedMaxPrice
        : DEFAULT_MAX_PRICE;
    const normalizedMaxPrice =
      safeMaxPrice < safeMinPrice ? DEFAULT_MAX_PRICE : safeMaxPrice;

    const safeMinStar = selectedStar > 0 ? selectedStar : DEFAULT_MIN_STAR;
    const safeMaxStar =
      typeof selectedMaxStar === "number" && selectedMaxStar > 0
        ? selectedMaxStar
        : DEFAULT_MAX_STAR;
    const normalizedMaxStar =
      safeMaxStar < safeMinStar ? DEFAULT_MAX_STAR : safeMaxStar;

    const effectiveSortMode =
      !isMyLocationMode && sortMode === "distance" ? "smart" : sortMode;

    return {
      cityCode: cityCode || undefined,
      keyword: keywordValue || undefined,
      userLat:
        isMyLocationMode &&
        typeof userLat === "number" &&
        Number.isFinite(userLat)
          ? userLat
          : undefined,
      userLng:
        isMyLocationMode &&
        typeof userLng === "number" &&
        Number.isFinite(userLng)
          ? userLng
          : undefined,
      minPrice: safeMinPrice,
      maxPrice: normalizedMaxPrice,
      minStar: safeMinStar,
      maxStar: normalizedMaxStar,
      sortBy:
        effectiveSortMode === "distance" ||
        effectiveSortMode === "price" ||
        effectiveSortMode === "score"
          ? effectiveSortMode
          : undefined,
      minScore,
      minOpeningYear: hasQuickNewOpen ? 2024 : undefined,
      checkIn: checkIn || defaultDates.checkIn,
      checkOut: checkOut || defaultDates.checkOut,
      roomsNeeded: safeRoomCount,
      peopleNeeded,
      tags: hotelTags.length > 0 ? hotelTags : undefined,
      room:
        hasRoomTags || hasRoomFacilities
          ? {
              tags: hasRoomTags ? { areaTitles, bedTitles } : undefined,
              facilities: hasRoomFacilities ? roomFacilities : undefined,
            }
          : undefined,
      page,
      pageSize: PAGE_SIZE,
    };
  };

  const getDiscountedHotelPrice = (hotel: HotelListItem) => {
    const normalPrice = toFiniteNumber(hotel.price, 0);
    const crossLinePrice = toFiniteNumber(hotel.crossLinePrice, 0);

    const promotions = Array.isArray(hotel.promotions) ? hotel.promotions : [];
    if (promotions.length === 0) {
      return normalPrice;
    }

    const now = Date.now();
    const activePromotions = promotions.filter((item) => {
      const start = new Date(item.startDate).getTime();
      const end = new Date(item.endDate).getTime();
      if (Number.isNaN(start) || Number.isNaN(end)) return false;
      return start <= now && now <= end;
    });

    if (activePromotions.length === 0) {
      return normalPrice;
    }

    const bestPromotion = activePromotions.reduce<PromotionItem | null>(
      (best, current) => {
        const bestDiscount = Number(best?.discount || 1);
        const currentDiscount = Number(current.discount || 1);
        if (!best) return current;
        return currentDiscount < bestDiscount ? current : best;
      },
      null,
    );

    const discount = Number(bestPromotion?.discount || 0);
    const basePrice = crossLinePrice > 0 ? crossLinePrice : normalPrice;
    if (!(discount > 0 && discount < 1) || basePrice <= 0) {
      return normalPrice;
    }

    return Math.max(1, Math.round(basePrice * discount));
  };

  const fetchHotelList = async ({
    page,
    append,
  }: {
    page: number;
    append: boolean;
  }) => {
    const hotelTagGroups = buildHotelTagGroups();
    const hotelTagVariants = buildHotelTagVariants(hotelTagGroups);

    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingHotels(true);
    }

    try {
      const responses =
        hotelTagVariants.length > 1
          ? await Promise.all(
              hotelTagVariants.map((tags) =>
                searchHotels(buildSearchHotelsParams(page, tags)),
              ),
            )
          : [await searchHotels(buildSearchHotelsParams(page))];

      const responseList = responses.map((item) => item.data || []);
      const nextList = Array.from(
        new Map(
          responseList
            .flat()
            .map((hotel) => [hotel.id, hotel] as [number, HotelListItem]),
        ).values(),
      );
      const responseTotal = responses.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0,
      );
      const requestHasMore = responses.some(
        (item) => (item.data || []).length >= PAGE_SIZE,
      );
      const nextTotal = responseTotal > 0 ? responseTotal : nextList.length;

      setCurrentPage(page);
      setHotels((current) => {
        if (!append) {
          const resetList = sortHotelsByMode(nextList, sortMode);
          setHasMore(requestHasMore && resetList.length < nextTotal);
          return resetList;
        }

        const existingIds = new Set(current.map((item) => item.id));
        const incomingUnique = nextList.filter(
          (item) => !existingIds.has(item.id),
        );
        const mergedList = [...current, ...incomingUnique];

        setHasMore(
          requestHasMore &&
            incomingUnique.length > 0 &&
            mergedList.length < nextTotal,
        );
        return mergedList;
      });
    } catch (error) {
      if (!append) {
        setHotels([]);
      }
      Taro.showToast({
        title: "获取酒店列表失败",
        icon: "none",
        duration: 1500,
      });
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoadingHotels(false);
      }
    }
  };

  const sortHotelsByMode = (list: HotelListItem[], mode: SortMode) => {
    const actualMode =
      !isMyLocationMode && mode === "distance" ? "smart" : mode;
    const sortedList = [...list];

    const resolvePriceForSort = (hotel: HotelListItem) => {
      const price = getDiscountedHotelPrice(hotel);
      return Number.isFinite(price) && price > 0
        ? price
        : Number.POSITIVE_INFINITY;
    };

    const WEIGHTS = {
      SCORE: 0.5, // 评分权重 50%
      DISTANCE: 0.3, // 距离权重 30% (定位时开启)
      COST: 0.2, // 价格权重 20%
    };

    // 如果没有定位，将距离的权重按比例分配给评分和成本
    const activeWeights = { ...WEIGHTS };
    if (!isMyLocationMode) {
      activeWeights.SCORE = 0.7; // 评分提升至 70%
      activeWeights.COST = 0.3; // 成本提升至 30%
      activeWeights.DISTANCE = 0;
    }
    const resolveCostForSort = (hotel: HotelListItem) => {
      const cost = getDiscountedHotelPrice(hotel);
      return Number.isFinite(cost) && cost > 0 ? cost : 5000; // 默认高价兜底
    };

    // --- 排序逻辑 ---
    if (actualMode === "smart") {
      sortedList.sort((left, right) => {
        const getSmartScore = (hotel: HotelListItem) => {
          // 1. 评分归一化 (0-5 分) -> 映射为 0-100 分
          const scoreBase = toFiniteNumber(hotel.score, 0);
          const normalizedScore = (scoreBase / 5) * 100;

          // 2. 距离归一化 (假设 10km 内为有效范围) -> 越近分数越高
          // 逻辑：10km 以上设为 0 分，0m 设为 100 分
          let normalizedDistance = 0;
          if (isMyLocationMode) {
            const dist = toFiniteNumber(hotel.distance, 10000);
            normalizedDistance = Math.max(0, 1 - dist / 10000) * 100;
          }

          // 3. 成本归一化 (假设 100-3000 元为常态) -> 越便宜分数越高
          // 逻辑：3000 元以上设为 0 分，100 元设为 100 分
          const cost = resolveCostForSort(hotel);
          const normalizedCost = Math.max(0, 1 - (cost - 100) / 2900) * 100;

          // 4. 计算加权总分
          return (
            normalizedScore * activeWeights.SCORE +
            normalizedDistance * activeWeights.DISTANCE +
            normalizedCost * activeWeights.COST
          );
        };

        return getSmartScore(right) - getSmartScore(left); // 总分高者排前面
      });
      return sortedList;
    }

    if (actualMode === "distance") {
      sortedList.sort((left, right) => {
        const leftDistance = toFiniteNumber(
          left.distance,
          Number.POSITIVE_INFINITY,
        );
        const rightDistance = toFiniteNumber(
          right.distance,
          Number.POSITIVE_INFINITY,
        );
        return leftDistance - rightDistance;
      });
      return sortedList;
    }

    if (actualMode === "price") {
      sortedList.sort((left, right) => {
        const leftPrice = resolvePriceForSort(left);
        const rightPrice = resolvePriceForSort(right);
        return leftPrice - rightPrice;
      });
      return sortedList;
    }

    if (actualMode === "score") {
      sortedList.sort((left, right) => {
        const leftScore = toFiniteNumber(left.score, Number.NEGATIVE_INFINITY);
        const rightScore = toFiniteNumber(
          right.score,
          Number.NEGATIVE_INFINITY,
        );
        return rightScore - leftScore;
      });
      return sortedList;
    }

    // just in case the mode isn't recognized (shouldn't happen),
    // return the original list so the caller always gets an array.
    return sortedList;
  };

  const availableSortOptions = useMemo(
    () =>
      SORT_OPTIONS.filter((option) =>
        option.value === "distance" ? isMyLocationMode : true,
      ),
    [isMyLocationMode],
  );

  useEffect(() => {
    if (!isMyLocationMode && sortMode === "distance") {
      setSortMode("smart");
      setHotels((current) => sortHotelsByMode(current, "smart"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyLocationMode, sortMode]);
  const facilityMap = {
    酒店设施: Object.keys(HOTEL_CN_TO_DB_TAG_MAP),
    客房设施: Object.keys(ROOM_CN_TO_DB_TAG_MAP),
    房间面积: Object.keys(ROOM_TAG_VALUE_MAP.areaTitles),
    评分: ["4.7以上", "4.5以上", "4.0以上", "3.5以上"],
  };

  const filterFields = Object.keys(facilityMap);
  const activeFieldTags = facilityMap[activeFacilityTab] || [];

  const roomFacilityGroups = useMemo(() => {
    const groupMap = ROOM_FACILITY_FIELDS.reduce(
      (result, field) => {
        result[field] = [];
        return result;
      },
      {} as Record<RoomFacilityField, string[]>,
    );

    Object.entries(ROOM_CN_TO_DB_TAG_MAP).forEach(([label, fieldMap]) => {
      (Object.keys(fieldMap || {}) as RoomFacilityField[]).forEach((field) => {
        if (!groupMap[field].includes(label)) {
          groupMap[field].push(label);
        }
      });
    });

    return ROOM_FACILITY_FIELDS.map((field) => ({
      field,
      label: ROOM_FACILITY_FIELD_LABEL_MAP[field],
      tags: groupMap[field],
    })).filter((group) => group.tags.length > 0);
  }, []);

  useEffect(() => {
    setDateRange([checkIn, checkOut]);
  }, [checkIn, checkOut]);

  useEffect(() => {
    // debounce the actual search request (not the input)
    let mounted = true;
    const delay = 300;
    const timer = setTimeout(() => {
      if (!mounted) return;
      void fetchHotelList({ page: 1, append: false });
    }, delay);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    city,
    cityCode,
    keyword,
    checkIn,
    checkOut,
    roomCount,
    adultCount,
    childCount,
    selectedStar,
    selectedMaxStar,
    selectedMinPrice,
    selectedMaxPrice,
    selectedFacilities,
    activeQuickChips,
  ]);

  useReachBottom(() => {
    const now = Date.now();
    if (now - reachBottomLastRef.current < REACH_BOTTOM_THROTTLE_MS) return;
    reachBottomLastRef.current = now;

    if (loadingHotels || loadingMore || !hasMore) return;
    void fetchHotelList({ page: currentPage + 1, append: true });
  });

  const normalizeDate = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    const dateValue = typeof value === "number" ? new Date(value) : value;
    if (typeof dateValue.getFullYear !== "function") return "";
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const resolveRange = (param) => {
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

  const handleCalendarConfirm = (param) => {
    const [startRaw, endRaw] = resolveRange(param);
    const startValue = normalizeDate(startRaw);
    const endValue = normalizeDate(endRaw);
    setDateRange([startValue, endValue]);
    setFilter({ checkIn: startValue, checkOut: endValue });
    setCalendarVisible(false);
  };

  const handleTripCalendarConfirm = (param) => {
    const [startRaw, endRaw] = resolveRange(param);
    const startValue = normalizeDate(startRaw);
    const endValue = normalizeDate(endRaw);
    setTripDraftDateRange([startValue, endValue]);
    setTripCalendarVisible(false);
  };

  const cityLabel = city || DEFAULT_CITY;
  const compactDateLabel = useMemo(() => {
    const formatDate = (value?: string) => {
      if (!value) return "--";
      const parts = value.split("-");
      if (parts.length !== 3) return value;
      return `${parts[1]}-${parts[2]}`;
    };
    return `${formatDate(checkIn)} ${formatDate(checkOut)}`;
  }, [checkIn, checkOut]);

  const staySummary = useMemo(() => {
    const safeRoomCount = Math.max(1, roomCount);
    const safePeopleCount = Math.max(1, adultCount + childCount);
    return `${safeRoomCount}间 ${safePeopleCount}人`;
  }, [adultCount, childCount, roomCount]);

  const tripDateLabel = useMemo(() => {
    const [tripCheckIn, tripCheckOut] = tripDraftDateRange;
    const formatDate = (value?: string) => {
      if (!value) return "--";
      const parts = value.split("-");
      if (parts.length !== 3) return value;
      return `${parts[1]}-${parts[2]}`;
    };

    const calcNights = (startDate?: string, endDate?: string) => {
      if (!startDate || !endDate) return 0;
      const startTime = new Date(startDate.replace(/-/g, "/")).getTime();
      const endTime = new Date(endDate.replace(/-/g, "/")).getTime();
      if (
        Number.isNaN(startTime) ||
        Number.isNaN(endTime) ||
        endTime <= startTime
      ) {
        return 0;
      }
      return Math.round((endTime - startTime) / (24 * 60 * 60 * 1000));
    };

    const nightsCount = calcNights(tripCheckIn, tripCheckOut);
    return {
      date: `${formatDate(tripCheckIn)} - ${formatDate(tripCheckOut)}`,
      nights: nightsCount > 0 ? `共${nightsCount}晚` : "",
    };
  }, [tripDraftDateRange]);

  const tripStaySummary = useMemo(() => {
    const safeRoomCount = Math.max(1, tripDraftRoomCount);
    const safeAdultCount = Math.max(1, tripDraftAdultCount);
    const safeChildCount = Math.max(0, tripDraftChildCount);
    return `${safeRoomCount}间 ${safeAdultCount}成人 ${safeChildCount}儿童`;
  }, [tripDraftAdultCount, tripDraftChildCount, tripDraftRoomCount]);

  const openTripPopdown = () => {
    const nextDraft = resolveTripCityDraft();
    setTripDraftCity(nextDraft.city);
    setTripDraftCityCode(nextDraft.cityCode);
    setTripDraftCityLabel(nextDraft.tripLabel);
    setTripDraftDateRange([
      checkIn || defaultDates.checkIn,
      checkOut || defaultDates.checkOut,
    ]);
    setTripDraftRoomCount(roomCount > 0 ? roomCount : 1);
    setTripDraftAdultCount(adultCount > 0 ? adultCount : 1);
    setTripDraftChildCount(childCount >= 0 ? childCount : 0);
    setTripVisible(true);
    setSortVisible(false);
  };

  const applyTripDraft = () => {
    const [nextCheckIn, nextCheckOut] = tripDraftDateRange;
    const isLocationSelected =
      Taro.getStorageSync(CITY_STORAGE_KEY) === MY_LOCATION_KEY;

    setFilter({
      city: tripDraftCity,
      cityCode: tripDraftCityCode,
      checkIn: nextCheckIn || defaultDates.checkIn,
      checkOut: nextCheckOut || defaultDates.checkOut,
      roomCount: tripDraftRoomCount,
      adultCount: tripDraftAdultCount,
      childCount: tripDraftChildCount,
    });

    setIsMyLocationMode(isLocationSelected);
    setTopLocationLabel(
      isLocationSelected ? "我的位置" : tripDraftCity || DEFAULT_CITY,
    );
    setTripVisible(false);
  };

  const mapCenter = useMemo(() => {
    const firstWithCoord = hotels.find(
      (hotel) =>
        typeof hotel.latitude === "number" &&
        !Number.isNaN(hotel.latitude) &&
        typeof hotel.longitude === "number" &&
        !Number.isNaN(hotel.longitude),
    );

    if (firstWithCoord?.latitude && firstWithCoord?.longitude) {
      return {
        latitude: firstWithCoord.latitude,
        longitude: firstWithCoord.longitude,
      };
    }

    return {
      latitude: 31.2304,
      longitude: 121.4737,
    };
  }, [hotels]);

  const openMapLocation = () => {
    Taro.openLocation({
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      name: cityLabel,
      address: cityLabel,
      scale: 14,
    });
  };

  const handleLocateInTrip = (event) => {
    event?.stopPropagation?.();

    Taro.getLocation({
      type: "gcj02",
      success: (res) => {
        const locationParam = `${res.latitude},${res.longitude}`;
        const sig = md5(
          `/ws/geocoder/v1?key=${QQ_MAP_KEY}&location=${locationParam}${QQ_MAP_SK}`,
        );

        Taro.request({
          url: `${QQ_MAP_BASE_URL}/geocoder/v1`,
          data: {
            key: QQ_MAP_KEY,
            location: locationParam,
            sig,
          },
          success: (response) => {
            const result = response?.data?.result;
            const geocoderCity =
              result?.address_component?.city ||
              result?.ad_info?.city ||
              result?.address_component?.district ||
              "";
            const resolvedCityInfo = resolveCityInfoByName(geocoderCity) || {
              name: city || DEFAULT_CITY,
              cityCode: cityCode || "",
            };
            const address =
              result?.formatted_addresses?.recommend || result?.address;
            const rawAddress = address
              ? String(address)
              : `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`;

            setTripDraftCity(resolvedCityInfo.name);
            setTripDraftCityCode(String(resolvedCityInfo.cityCode || ""));
            setTripDraftCityLabel(rawAddress || "我的位置");
            setFilter({
              userLat: res.latitude,
              userLng: res.longitude,
            });

            Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
            Taro.setStorageSync(CITY_LOCATION_INFO_KEY, resolvedCityInfo);
            Taro.setStorageSync(CITY_ADDRESS_KEY, rawAddress);

            Taro.showToast({
              title: "定位成功",
              icon: "success",
              duration: 1200,
            });
          },
          fail: () => {
            Taro.showToast({ title: "定位失败", icon: "none", duration: 1500 });
          },
        });
      },
      fail: () => {
        Taro.showToast({ title: "定位失败", icon: "none", duration: 1500 });
      },
    });
  };

  const nights = useMemo(() => {
    const safeCheckIn = checkIn || defaultDates.checkIn;
    const safeCheckOut = checkOut || defaultDates.checkOut;
    const startTime = new Date(safeCheckIn.replace(/-/g, "/")).getTime();
    const endTime = new Date(safeCheckOut.replace(/-/g, "/")).getTime();
    if (
      Number.isNaN(startTime) ||
      Number.isNaN(endTime) ||
      endTime <= startTime
    ) {
      return 0;
    }
    return Math.round((endTime - startTime) / (24 * 60 * 60 * 1000));
  }, [checkIn, checkOut]);

  const formatDistance = (distance?: number) => {
    if (!isMyLocationMode) {
      return "";
    }
    if (typeof distance !== "number" || Number.isNaN(distance)) {
      return "";
    }
    if (distance >= 1000) {
      return `距您直线距离${(distance / 1000).toFixed(1)}公里`;
    }
    return `距您直线距离${Math.round(distance)}米`;
  };

  const updateGuestCount = (nextValue, minValue, maxValue, setter) => {
    const max = typeof maxValue === "number" ? maxValue : 99;
    const min = typeof minValue === "number" ? minValue : 0;
    const safeValue = Math.max(min, Math.min(max, nextValue));
    setter(safeValue);
  };

  const handleToggleFacility = (item: string) => {
    setSelectedFacilities((current) => {
      if (current.includes(item)) {
        return current.filter((value) => value !== item);
      }
      return [...current, item];
    });
  };

  const toggleQuickChip = (chip: QuickFilterChip) => {
    setActiveQuickChips((current) =>
      current.includes(chip)
        ? current.filter((item) => item !== chip)
        : [...current, chip],
    );
  };

  const handleOpenDetail = (hotelId: string | number) => {
    Taro.navigateTo({ url: `/package-hotel/detail/index?id=${hotelId}` });
  };

  // moved format/getPrice helpers into HotelList component

  const selectedSortLabel =
    availableSortOptions.find((option) => option.value === sortMode)?.label ||
    "智能排序";

  const topCardVisible =
    tripVisible || sortVisible || priceStarVisible || filterVisible;

  const closeTopCards = () => {
    setTripVisible(false);
    setSortVisible(false);
    setPriceStarVisible(false);
    setFilterVisible(false);
    setTripCalendarVisible(false);
    setGuestVisible(false);
  };

  const stopOverlayTouchMove = (event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();
  };

  return (
    <View
      className={topCardVisible ? "list-page is-top-card-open" : "list-page"}
    >
      <View className="list-top">
        <View className="list-top__main">
          <View className="list-top__searchbar">
            <View
              className="list-top__trip"
              onClick={() => {
                if (tripVisible) {
                  setTripVisible(false);
                } else {
                  closeTopCards();
                  openTripPopdown();
                }
              }}
            >
              <View className="list-top__trip-item-position">
                {topLocationLabel}
              </View>
              <View className="list-top__trip-item">
                {compactDateLabel.replace(" ", "\n")}
              </View>
              <View className="list-top__trip-item">
                {staySummary.replace(" ", "\n")}
              </View>
            </View>
            <View className="list-top__divider" />

            <View className="list-top__keyword">
              <View className="list-top__keyword-icon" />
              <Input
                className="list-top__keyword-input"
                value={keyword}
                onInput={(event) => setFilter({ keyword: event.detail.value })}
                placeholder="位置/品牌/酒店"
                placeholderClass="list-top__keyword-placeholder"
              />
            </View>
          </View>

          <View className="list-top__map" onClick={openMapLocation}>
            <Image
              className="list-top__map-icon"
              src={mapIcon}
              mode="aspectFit"
            />
            <View className="list-top__map-text">地图</View>
          </View>
        </View>

        {tripVisible && (
          <View
            className="list-top__trip-popdown"
            onClick={closeTopCards}
            catchMove
            onTouchMove={stopOverlayTouchMove}
          >
            <View
              className="list-top__trip-panel"
              onClick={(event) => event.stopPropagation()}
              catchMove
              onTouchMove={stopOverlayTouchMove}
            >
              <View
                className="list-top__trip-option"
                onClick={() => {
                  setPendingTripCityPick(true);
                  closeTopCards();
                  Taro.navigateTo({ url: "/package-common/city/index" });
                }}
              >
                <View className="list-top__trip-option-value">
                  {tripDraftCityLabel}
                </View>
                <View
                  className="list-top__trip-option-locate"
                  onClick={handleLocateInTrip}
                >
                  <View className="location-col__locate-dot" />
                </View>
              </View>

              <View
                className="list-top__trip-option"
                onClick={() => {
                  setTripCalendarVisible(true);
                }}
              >
                <View className="list-top__trip-option-value">
                  {tripDateLabel.date}
                </View>
                <View className="list-top__trip-option-value-small">
                  {tripDateLabel.nights}
                </View>
              </View>

              <View
                className="list-top__trip-option"
                onClick={() => {
                  setGuestVisible(true);
                }}
              >
                <View className="list-top__trip-option-value">
                  {tripStaySummary}
                </View>
              </View>

              <View className="list-top__trip-confirm-wrap">
                <Button
                  className="list-top__trip-confirm"
                  type="primary"
                  onClick={applyTripDraft}
                >
                  确认
                </Button>
              </View>
            </View>
          </View>
        )}

        <View className="list-top__actions">
          <View
            className="list-top__action"
            onClick={() => {
              setActiveTopAction("sort");
              setTripVisible(false);
              setPriceStarVisible(false);
              setTripCalendarVisible(false);
              setGuestVisible(false);
              setSortVisible((current) => !current);
            }}
          >
            <View
              className={
                activeTopAction === "sort"
                  ? "list-top__action-text is-active"
                  : "list-top__action-text"
              }
            >
              {selectedSortLabel}
            </View>
            <ArrowDown
              className={
                activeTopAction === "sort"
                  ? "list-top__action-arrow is-active"
                  : "list-top__action-arrow"
              }
            />
          </View>

          <View
            className="list-top__action"
            onClick={() => {
              setActiveTopAction("priceStar");
              setSortVisible(false);
              setTripVisible(false);
              setTripCalendarVisible(false);
              setGuestVisible(false);
              setPriceStarVisible(!priceStarVisible);
            }}
          >
            <View
              className={
                activeTopAction === "priceStar"
                  ? "list-top__action-text is-active"
                  : "list-top__action-text"
              }
            >
              价格/星级
            </View>
            <ArrowDown
              className={
                activeTopAction === "priceStar"
                  ? "list-top__action-arrow is-active"
                  : "list-top__action-arrow"
              }
            />
          </View>

          <View
            className="list-top__action"
            onClick={() => {
              setActiveTopAction("filter");
              setSortVisible(false);
              setTripVisible(false);
              setPriceStarVisible(false);
              setTripCalendarVisible(false);
              setGuestVisible(false);
              setFilterVisible(!filterVisible);
            }}
          >
            <View
              className={
                activeTopAction === "filter"
                  ? "list-top__action-text is-active"
                  : "list-top__action-text"
              }
            >
              筛选
            </View>
            <ArrowDown
              className={
                activeTopAction === "filter"
                  ? "list-top__action-arrow is-active"
                  : "list-top__action-arrow"
              }
            />
          </View>
        </View>

        {sortVisible && (
          <View
            className="list-top__sort-popdown"
            onClick={closeTopCards}
            catchMove
            onTouchMove={stopOverlayTouchMove}
          >
            <View
              className="list-top__sort-panel"
              onClick={(event) => event.stopPropagation()}
              catchMove
              onTouchMove={stopOverlayTouchMove}
            >
              {availableSortOptions.map((option) => {
                const active = option.value === sortMode;
                return (
                  <View
                    key={option.value}
                    className={
                      active
                        ? "list-top__sort-option is-active"
                        : "list-top__sort-option"
                    }
                    onClick={() => {
                      setSortMode(option.value);
                      setHotels((current) =>
                        sortHotelsByMode(current, option.value),
                      );
                      closeTopCards();
                      setActiveTopAction("sort");
                    }}
                  >
                    <View>{option.label}</View>
                    {active && <Checked color="#2b64f2" width="16px" />}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className="list-top__chips">
          {QUICK_FILTER_TAGS.map((chip) => (
            <View
              key={chip}
              className={
                activeQuickChips.includes(chip)
                  ? "list-top__chip is-active"
                  : "list-top__chip"
              }
              onClick={() => toggleQuickChip(chip)}
            >
              {chip}
            </View>
          ))}
        </View>
      </View>

      {/* <View className="list-top__map-card" onClick={openMapLocation}>
        <Map
          id="listTopMap"
          className="list-top__map-preview"
          longitude={mapCenter.longitude}
          latitude={mapCenter.latitude}
          scale={13}
          onError={() => {}}
          markers={[
            {
              id: 1,
              longitude: mapCenter.longitude,
              latitude: mapCenter.latitude,
              iconPath:
                FALLBACK_MAP_MARKER_ICON_URL,
              width: 22,
              height: 22,
            },
          ]}
        />
        <View className="list-top__map-mask">查看地图</View>
      </View> */}

      <HotelList
        loadingHotels={loadingHotels}
        hotels={hotels}
        loadingMore={loadingMore}
        hasMore={hasMore}
        nights={nights}
        onOpenDetail={handleOpenDetail}
        onLoadMore={() => {
          if (loadingHotels || loadingMore || !hasMore) return;
          void fetchHotelList({ page: currentPage + 1, append: true });
        }}
        formatDistance={formatDistance}
      />

      <Calendar
        visible={calendarVisible}
        defaultValue={dateRange}
        type="range"
        onClose={() => setCalendarVisible(false)}
        onConfirm={handleCalendarConfirm}
      />

      <Calendar
        visible={tripCalendarVisible}
        defaultValue={tripDraftDateRange}
        type="range"
        onClose={() => setTripCalendarVisible(false)}
        onConfirm={handleTripCalendarConfirm}
      />

      {filterVisible && (
        <View
          className="list-top__filter-popdown"
          onClick={closeTopCards}
          catchMove
          onTouchMove={stopOverlayTouchMove}
        >
          <View
            className="list-top__filter-panel"
            onClick={(event) => event.stopPropagation()}
            catchMove
          >
            <View className="list-top__filter-content">
              <View className="list-top__filter-sidebar">
                {filterFields.map((field) => (
                  <View
                    key={field}
                    className={
                      field === activeFacilityTab
                        ? "list-top__filter-field is-active"
                        : "list-top__filter-field"
                    }
                    onClick={() => setActiveFacilityTab(field)}
                  >
                    <SideNavBarItem title={field} value={field} />
                  </View>
                ))}
              </View>

              <ScrollView className="list-top__filter-tags-wrap" scrollY>
                <View className="list-top__filter-tags-title">
                  {activeFacilityTab}
                </View>
                {activeFacilityTab === "客房设施" ? (
                  <View className="list-top__filter-group-list">
                    {roomFacilityGroups.map((group) => (
                      <View
                        className="list-top__filter-group"
                        key={group.field}
                      >
                        <View className="list-top__filter-group-title">
                          {group.label}
                        </View>
                        <View className="list-top__filter-tags">
                          {group.tags.map((tag) => (
                            <View
                              key={`${group.field}-${tag}`}
                              className={
                                selectedFacilities.includes(tag)
                                  ? "list-top__filter-tag is-active"
                                  : "list-top__filter-tag"
                              }
                              onClick={() => handleToggleFacility(tag)}
                            >
                              {tag}
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="list-top__filter-tags">
                    {activeFieldTags.map((tag) => (
                      <View
                        key={tag}
                        className={
                          selectedFacilities.includes(tag)
                            ? "list-top__filter-tag is-active"
                            : "list-top__filter-tag"
                        }
                        onClick={() => handleToggleFacility(tag)}
                      >
                        {tag}
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>

            <View className="list-top__filter-footer">
              <Button
                className="list-top__filter-reset"
                onClick={() => setSelectedFacilities([])}
              >
                清空
              </Button>
              <Button
                className="list-top__filter-submit"
                type="primary"
                onClick={() => {
                  setFilterVisible(false);
                  void fetchHotelList({ page: 1, append: false });
                }}
              >
                完成
              </Button>
            </View>
          </View>
        </View>
      )}

      <Popup
        visible={guestVisible}
        position="bottom"
        onClose={() => setGuestVisible(false)}
      >
        <View className="guest-popup">
          <View className="guest-popup__header">
            <View
              className="guest-popup__close"
              onClick={() => setGuestVisible(false)}
            >
              <Close color="grey" width="12px" />
            </View>
            <View className="guest-popup__title">选择客房和入住人数</View>
          </View>
          <View className="guest-popup__tips">
            入住人数较多时，试试增加间数
          </View>
          <GuestSelector
            roomCount={tripDraftRoomCount}
            adultCount={tripDraftAdultCount}
            childCount={tripDraftChildCount}
            onChangeRoom={(next) =>
              updateGuestCount(next, 1, 99, setTripDraftRoomCount)
            }
            onChangeAdult={(next) =>
              updateGuestCount(next, 1, 99, setTripDraftAdultCount)
            }
            onChangeChild={(next) =>
              updateGuestCount(next, 0, 99, setTripDraftChildCount)
            }
          />
          <Button
            className="guest-popup__confirm"
            type="primary"
            onClick={() => setGuestVisible(false)}
          >
            完成
          </Button>
        </View>
      </Popup>

      {priceStarVisible && (
        <View
          className="list-top__price-star-popdown"
          onClick={closeTopCards}
          catchMove
          onTouchMove={stopOverlayTouchMove}
        >
          <View
            className="list-top__price-star-panel"
            onClick={(event) => event.stopPropagation()}
            catchMove
            onTouchMove={stopOverlayTouchMove}
          >
            <PriceStarPopup
              initialValue={{
                minPrice: selectedMinPrice,
                maxPrice: selectedMaxPrice,
                minStar: selectedStar > 0 ? selectedStar : undefined,
                maxStar: selectedMaxStar,
              }}
              onConfirm={(value) => {
                setSelectedMinPrice(value.minPrice);
                setSelectedMaxPrice(value.maxPrice);
                setSelectedStar(value.minStar || 0);
                setSelectedMaxStar(value.maxStar);
                setPriceStarVisible(false);
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default ListPage;
