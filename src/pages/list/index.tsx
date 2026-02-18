import { Image, Input, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";
import { Button, Calendar, Popup } from "@nutui/nutui-react-taro";
import { ArrowDown, Close } from "@nutui/icons-react-taro";
import GuestSelector from "../../components/guest-selector";
import PriceStarPopup from "../../components/price-star-popup";
import { useSharedFilter } from "../../store/filter-context";
import { searchHotels } from "../../apis/hotels";
import type { HotelListItem } from "../../apis/type";
import "./index.scss";

const DEFAULT_CITY = "上海";

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
  const [selectedMinPrice, setSelectedMinPrice] = useState<number | undefined>(
    undefined,
  );
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | undefined>(
    undefined,
  );
  const [priceStarVisible, setPriceStarVisible] = useState(false);
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);

  useEffect(() => {
    const nextKeyword = normalizeParam(params.keyword);
    const nextCity = normalizeParam(params.city);
    const nextCityCode = normalizeParam(params.cityCode);
    const nextCheckIn = normalizeParam(params.checkIn);
    const nextCheckOut = normalizeParam(params.checkOut);
    const nextMinPrice = Number(normalizeParam(params.minPrice));
    const nextMaxPrice = Number(normalizeParam(params.maxPrice));
    const nextMinStar = Number(normalizeParam(params.minStar));
    const nextRoomCount = Number(params.room) || 1;
    const nextAdultCount = Number(params.adult) || 1;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHotelList = async () => {
    const peopleNeeded = adultCount + childCount;
    const keywordValue = keyword.trim();

    setLoadingHotels(true);

    try {
      const response = await searchHotels({
        cityCode,
        keyword: keywordValue || undefined,
        minPrice: selectedMinPrice,
        maxPrice: selectedMaxPrice,
        checkIn,
        checkOut,
        roomsNeeded: roomCount,
        peopleNeeded,
        minStar: selectedStar > 0 ? selectedStar : undefined,
        tags: selectedFacilities.length > 0 ? selectedFacilities : undefined,
        page: 1,
        pageSize: 20,
      });

      setHotels(response.data || []);
    } catch (error) {
      setHotels([]);
      Taro.showToast({
        title: "获取酒店列表失败",
        icon: "none",
        duration: 1500,
      });
    } finally {
      setLoadingHotels(false);
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
      void fetchHotelList();
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
    selectedMinPrice,
    selectedMaxPrice,
    selectedFacilities,
  ]);

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
              void fetchHotelList();
            }}
          >
            确定
          </Button>
        </View>
      </Popup>

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
