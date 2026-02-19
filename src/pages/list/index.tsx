import { Image, Input, View } from "@tarojs/components";
import Taro, { useReachBottom } from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";
import { Button, Calendar, Popup } from "@nutui/nutui-react-taro";
import { ArrowDown, Close } from "@nutui/icons-react-taro";
import GuestSelector from "../../components/guest-selector";
import PriceStarPopup from "../../components/price-star-popup";
import { useSharedFilter } from "../../store/filter-context";
import { searchHotels } from "../../apis/hotels";
import {
  HOTEL_CN_TO_DB_TAG_MAP,
  ROOM_CN_TO_DB_TAG_MAP,
  ROOM_TAG_VALUE_MAP,
} from "../../apis/tag_map";
import type {
  HotelListItem,
  SearchHotelsParams,
  SearchRoomFacilityFilters,
} from "../../apis/type";
import "./index.scss";

const DEFAULT_CITY = "上海";
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000000;
const DEFAULT_MIN_STAR = 2;
const DEFAULT_MAX_STAR = 5;
const PAGE_SIZE = 20;

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
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const nextKeyword = normalizeParam(params.keyword);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildSearchHotelsParams = (page: number): SearchHotelsParams => {
    const keywordValue = keyword.trim();
    const safeRoomCount = roomCount > 0 ? roomCount : 1;
    const safeAdultCount = adultCount > 0 ? adultCount : 1;
    const safeChildCount = childCount >= 0 ? childCount : 0;
    const peopleNeeded = safeAdultCount + safeChildCount;

    const selectedSet = new Set(selectedFacilities);

    const hotelLabels = facilityMap.酒店设施 || [];
    const roomLabels = facilityMap.客房设施 || [];
    const areaLabels = facilityMap.房间面积 || [];
    const scoreLabels = facilityMap.评分 || [];

    const hotelTags = Array.from(
      new Set(
        hotelLabels
          .filter((label) => selectedSet.has(label))
          .flatMap((label) => HOTEL_CN_TO_DB_TAG_MAP[label] || []),
      ),
    );

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
    const hasRoomTags = areaTitles.length > 0;
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

    return {
      cityCode: cityCode || undefined,
      keyword: keywordValue || undefined,
      minPrice: safeMinPrice,
      maxPrice: normalizedMaxPrice,
      minStar: safeMinStar,
      maxStar: normalizedMaxStar,
      minScore: minScoreBySelection,
      checkIn: checkIn || defaultDates.checkIn,
      checkOut: checkOut || defaultDates.checkOut,
      roomsNeeded: safeRoomCount,
      peopleNeeded,
      tags: hotelTags.length > 0 ? hotelTags : undefined,
      room:
        hasRoomTags || hasRoomFacilities
          ? {
              tags: hasRoomTags ? { areaTitles } : undefined,
              facilities: hasRoomFacilities ? roomFacilities : undefined,
            }
          : undefined,
      page,
      pageSize: PAGE_SIZE,
    };
  };

  const fetchHotelList = async ({
    page,
    append,
  }: {
    page: number;
    append: boolean;
  }) => {
    const searchParams = buildSearchHotelsParams(page);

    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingHotels(true);
    }

    try {
      const response = await searchHotels(searchParams);
      const nextList = response.data || [];
      const nextTotal = Number(response.total || 0);

      setTotalCount(nextTotal);
      setCurrentPage(page);
      setHasMore(page * PAGE_SIZE < nextTotal);
      setHotels((current) => (append ? [...current, ...nextList] : nextList));
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

  const filterTabs = ["酒店设施", "客房设施", "房间面积", "评分"];
  const facilityMap = {
    酒店设施: ["免费WIFI", "健身房", "电视", "停车场"],
    客房设施: ["浴缸", "吹风机", "书桌", "咖啡机"],
    房间面积: ["20-25m2", "25-30m2", "30m2+"],
    评分: ["4.5以上", "4.0以上", "3.5以上"],
  };

  useEffect(() => {
    setDateRange([checkIn, checkOut]);
  }, [checkIn, checkOut]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchHotelList({ page: 1, append: false });
    }, 250);
    return () => clearTimeout(timer);
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
  ]);

  useReachBottom(() => {
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

  const dateLabel = useMemo(() => {
    const formatDate = (value?: string) => {
      if (!value) return "";
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

    const start = formatDate(checkIn);
    const end = formatDate(checkOut);
    const nights = calcNights(checkIn, checkOut);
    if (start && end) {
      return `${start} - ${end} ${nights}晚`;
    }
    return "选择日期";
  }, [checkIn, checkOut]);

  const cityLabel = city || DEFAULT_CITY;
  const priceStarLabel = useMemo(() => {
    const priceText =
      typeof selectedMinPrice === "number"
        ? typeof selectedMaxPrice === "number"
          ? `¥${selectedMinPrice}-¥${selectedMaxPrice}`
          : `¥${selectedMinPrice}以上`
        : "价格/星级";

    const starText = selectedStar > 0 ? `${selectedStar}钻/星起` : "";
    return starText ? `${priceText} ${starText}` : priceText;
  }, [selectedMaxPrice, selectedMinPrice, selectedStar]);

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
    if (typeof distance !== "number" || Number.isNaN(distance)) {
      return "暂无距离信息";
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

  const handleOpenDetail = (hotelId: string | number) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` });
  };

  return (
    <View className="list-page">
      <View className="list-search">
        <View className="list-search__box">
          <View className="list-search__icon" />
          <Input
            className="list-search__input"
            value={keyword}
            onInput={(event) => setFilter({ keyword: event.detail.value })}
            placeholder="搜索..."
            placeholderClass="list-search__placeholder"
          />
          <View
            className="list-search__tune"
            onClick={() => setFilterVisible(true)}
          >
            =
          </View>
        </View>
      </View>

      <View className="list-filters">
        <View className="list-filter list-filter--primary">
          <View className="list-filter__icon is-pin" />
          <View className="list-filter__text">{cityLabel}</View>
        </View>
        <View className="list-filter list-filter--primary">
          <View className="list-filter__icon is-calendar" />
          <View className="list-filter__text">{dateLabel}</View>
        </View>
        <View className="list-filter" onClick={() => setPriceStarVisible(true)}>
          <View className="list-filter__icon is-star">*</View>
          <View className="list-filter__text">{priceStarLabel}</View>
        </View>
      </View>

      <View className="hotel-list">
        {loadingHotels && <View className="hotel-list__empty">加载中...</View>}
        {!loadingHotels && hotels.length === 0 && (
          <View className="hotel-list__empty">暂无符合条件的酒店</View>
        )}
        {!loadingHotels &&
          hotels.map((hotel) => (
            <View
              className="hotel-card"
              key={hotel.id}
              onClick={() => handleOpenDetail(hotel.id)}
            >
              <View className="hotel-card__media">
                <Image
                  className="hotel-card__image"
                  src={
                    hotel.imageUrls?.[0] ||
                    "https://dummyimage.com/600x400/f0f2f5/999999&text=Hotel"
                  }
                  mode="aspectFill"
                />
                <View className="hotel-card__rating">
                  <View className="hotel-card__rating-icon" />
                  <View>
                    {typeof hotel.score === "number"
                      ? hotel.score.toFixed(1)
                      : "--"}
                  </View>
                </View>
                <View className="hotel-card__fav">Fav</View>
              </View>
              <View className="hotel-card__body">
                <View className="hotel-card__title">
                  {hotel.nameCn || hotel.nameEn}
                </View>
                <View className="hotel-card__row">
                  <View className="hotel-card__distance">
                    {formatDistance(hotel.distance)}
                  </View>
                  <View className="hotel-card__price">
                    ¥ {hotel.price || 0}起
                  </View>
                </View>
                <View className="hotel-card__row">
                  <View className="hotel-card__tags">
                    {(hotel.shortTags || []).slice(0, 3).map((tag) => (
                      <View className="hotel-card__tag" key={tag}>
                        {tag}
                      </View>
                    ))}
                  </View>
                  <View className="hotel-card__nights">{nights}晚</View>
                </View>
              </View>
            </View>
          ))}
      </View>

      <Popup
        visible={filterVisible}
        position="bottom"
        onClose={() => setFilterVisible(false)}
      >
        <View className="filter-panel">
          <View className="filter-panel__header">
            <View
              className="filter-panel__close"
              onClick={() => setFilterVisible(false)}
            >
              <Close color="#9aa4b2" width="14px" />
            </View>
            <View className="filter-panel__title">筛选</View>
          </View>

          <View className="filter-section">
            <View className="filter-section__title">关键词</View>
            <View className="filter-section__input">
              <Input
                value={keyword}
                onInput={(event) => setFilter({ keyword: event.detail.value })}
                placeholder="位置/品牌/酒店"
                placeholderClass="filter-input__placeholder"
              />
            </View>
          </View>

          <View className="filter-section">
            <View className="filter-section__title">价格/星级</View>
            <View
              className="filter-chip filter-chip--wide"
              onClick={() => setPriceStarVisible(true)}
            >
              <View>{priceStarLabel}</View>
              <ArrowDown color="#9aa4b2" width="12px" />
            </View>
          </View>

          <View className="filter-section">
            <View className="filter-section__title">入住日期</View>
            <View
              className="filter-chip filter-chip--wide"
              onClick={() => setCalendarVisible(true)}
            >
              <View>{dateLabel}</View>
              <ArrowDown color="#9aa4b2" width="12px" />
            </View>
            <Calendar
              visible={calendarVisible}
              defaultValue={dateRange}
              type="range"
              onClose={() => setCalendarVisible(false)}
              onConfirm={handleCalendarConfirm}
            />
          </View>

          <View className="filter-section">
            <View className="filter-section__title">选择客房和入住人数</View>
            <GuestSelector
              roomCount={roomCount}
              adultCount={adultCount}
              childCount={childCount}
              onChangeRoom={(next) =>
                updateGuestCount(next, 1, 99, (value) =>
                  setFilter({ roomCount: value }),
                )
              }
              onChangeAdult={(next) =>
                updateGuestCount(next, 1, 99, (value) =>
                  setFilter({ adultCount: value }),
                )
              }
              onChangeChild={(next) =>
                updateGuestCount(next, 0, 99, (value) =>
                  setFilter({ childCount: value }),
                )
              }
            />
          </View>

          <View className="filter-section">
            <View className="filter-section__title">城市</View>
            <View className="filter-city">
              {["上海", "苏州", "北京"].map((cityItem) => (
                <View
                  key={cityItem}
                  className={
                    cityItem === city
                      ? "filter-city__item is-active"
                      : "filter-city__item"
                  }
                  onClick={() => setFilter({ city: cityItem })}
                >
                  {cityItem}
                </View>
              ))}
            </View>
          </View>

          <View className="filter-tabs">
            {filterTabs.map((tab) => (
              <View
                key={tab}
                className={
                  tab === activeFacilityTab
                    ? "filter-tabs__item is-active"
                    : "filter-tabs__item"
                }
                onClick={() => setActiveFacilityTab(tab)}
              >
                {tab}
              </View>
            ))}
          </View>

          <View className="filter-checklist">
            {(facilityMap[activeFacilityTab] || []).map((item) => (
              <View className="filter-checklist__item" key={item}>
                <View className="filter-checklist__label">{item}</View>
                <View
                  className={
                    selectedFacilities.includes(item)
                      ? "filter-checklist__box is-active"
                      : "filter-checklist__box"
                  }
                  onClick={() => handleToggleFacility(item)}
                >
                  {selectedFacilities.includes(item) ? "✓" : ""}
                </View>
              </View>
            ))}
          </View>

          <Button
            className="filter-panel__confirm"
            type="primary"
            onClick={() => {
              setFilterVisible(false);
              void fetchHotelList({ page: 1, append: false });
            }}
          >
            确定
          </Button>
        </View>
      </Popup>

      {!loadingHotels && hotels.length > 0 && (
        <View className="hotel-list__footer">
          {loadingMore
            ? "加载更多中..."
            : hasMore
              ? `已加载${hotels.length}/${totalCount}，上拉加载更多`
              : `已加载全部${totalCount}条`}
        </View>
      )}

      <PriceStarPopup
        visible={priceStarVisible}
        onClose={() => setPriceStarVisible(false)}
        initialValue={{
          minPrice: selectedMinPrice,
          maxPrice: selectedMaxPrice,
          minStar: selectedStar > 0 ? selectedStar : undefined,
        }}
        onConfirm={(value) => {
          setSelectedMinPrice(value.minPrice);
          setSelectedMaxPrice(value.maxPrice);
          setSelectedStar(value.minStar || 0);
        }}
      />
    </View>
  );
}

export default ListPage;
