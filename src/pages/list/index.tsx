import { Image, Input, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";
import { Button, Calendar, Popup } from "@nutui/nutui-react-taro";
import { ArrowDown, Close } from "@nutui/icons-react-taro";
import GuestSelector from "../../components/guest-selector";
import { useSharedFilter } from "../../store/filter-context";
import quanjiImage from "../../../assets/imgs/quanji.png";
import rujiaImage from "../../../assets/imgs/rujia.png";
import "./index.scss";

const mockHotels = [
  {
    id: "1",
    name: "全季酒店(上海长寿路地铁站店)",
    distance: "距您直线距离4.1公里",
    price: 340,
    nights: 1,
    rating: 4.9,
    tags: ["洗衣房", "免费停车", "自助早餐"],
    image: quanjiImage,
  },
  {
    id: "2",
    name: "如家酒店",
    distance: "距您直线距离3.9公里",
    price: 276,
    nights: 1,
    rating: 4.9,
    tags: ["免费停车", "健身房"],
    image: rujiaImage,
  },
];

function ListPage() {
  const params = Taro.getCurrentInstance().router?.params || {};
  const { filter, setFilter } = useSharedFilter();
  const {
    city,
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
  const [filterVisible, setFilterVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [dateRange, setDateRange] = useState<string[]>([checkIn, checkOut]);
  const [activeFacilityTab, setActiveFacilityTab] = useState("酒店设施");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    "免费WIFI",
    "停车场",
  ]);
  const [selectedStar, setSelectedStar] = useState(4);

  useEffect(() => {
    const nextKeyword = decodeParam(params.keyword);
    const nextCity = decodeParam(params.city);
    const nextRoomCount = Number(params.room) || 1;
    const nextAdultCount = Number(params.adult) || 1;
    const nextChildCount = Number(params.child) || 0;

    setFilter({
      keyword: nextKeyword || keyword,
      city: nextCity || city,
      checkIn: params.checkIn || checkIn,
      checkOut: params.checkOut || checkOut,
      roomCount: nextRoomCount,
      adultCount: nextAdultCount,
      childCount: nextChildCount,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const cityLabel = city || "城市";
  const priceLabel = "￥0 ~ ￥400";

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

  const handleOpenDetail = (hotelId: string) => {
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
        <View className="list-filter">
          <View className="list-filter__icon is-star">*</View>
          <View className="list-filter__text">评分</View>
        </View>
      </View>

      <View className="hotel-list">
        {mockHotels.map((hotel) => (
          <View
            className="hotel-card"
            key={hotel.id}
            onClick={() => handleOpenDetail(hotel.id)}
          >
            <View className="hotel-card__media">
              <Image
                className="hotel-card__image"
                src={hotel.image}
                mode="aspectFill"
              />
              <View className="hotel-card__rating">
                <View className="hotel-card__rating-icon" />
                <View>{hotel.rating}</View>
              </View>
              <View className="hotel-card__fav">Fav</View>
            </View>
            <View className="hotel-card__body">
              <View className="hotel-card__title">{hotel.name}</View>
              <View className="hotel-card__row">
                <View className="hotel-card__distance">{hotel.distance}</View>
                <View className="hotel-card__price">¥ {hotel.price}起</View>
              </View>
              <View className="hotel-card__row">
                <View className="hotel-card__tags">
                  {hotel.tags.map((tag) => (
                    <View className="hotel-card__tag" key={tag}>
                      {tag}
                    </View>
                  ))}
                </View>
                <View className="hotel-card__nights">{hotel.nights}晚</View>
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
            <View className="filter-section__header">
              <View className="filter-section__title">价格</View>
              <View className="filter-section__hint">{priceLabel}</View>
            </View>
            <View className="filter-price">
              <View className="filter-price__track" />
              <View className="filter-price__range" />
              <View className="filter-price__thumb filter-price__thumb--left" />
              <View className="filter-price__thumb filter-price__thumb--right" />
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

          <View className="filter-section">
            <View className="filter-section__title">星级/钻级</View>
            <View className="filter-stars">
              {[5, 4, 3, 2, 1].map((level) => (
                <View
                  key={level}
                  className={
                    level === selectedStar
                      ? "filter-star is-active"
                      : "filter-star"
                  }
                  onClick={() => setSelectedStar(level)}
                >
                  <View className="filter-star__icon">★</View>
                  <View>{level}</View>
                </View>
              ))}
            </View>
          </View>

          <Button
            className="filter-panel__confirm"
            type="primary"
            onClick={() => setFilterVisible(false)}
          >
            确定
          </Button>
        </View>
      </Popup>
    </View>
  );
}

export default ListPage;
