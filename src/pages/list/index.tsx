import { Image, Input, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useMemo, useState } from "react";
import { Button, Popup } from "@nutui/nutui-react-taro";
import { ArrowDown, Close } from "@nutui/icons-react-taro";
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
  const decodeParam = (value?: string) => {
    if (!value) return "";
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return value;
    }
  };
  const [keyword, setKeyword] = useState(decodeParam(params.keyword));
  const [filterVisible, setFilterVisible] = useState(false);
  const [roomCount, setRoomCount] = useState(Number(params.room) || 1);
  const [adultCount, setAdultCount] = useState(Number(params.adult) || 1);
  const [childCount, setChildCount] = useState(Number(params.child) || 0);
  const [selectedCity, setSelectedCity] = useState(
    decodeParam(params.city) || "上海",
  );
  const [activeFacilityTab, setActiveFacilityTab] = useState("酒店设施");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    "免费WIFI",
    "停车场",
  ]);
  const [selectedStar, setSelectedStar] = useState(4);

  const filterTabs = ["酒店设施", "客房设施", "房间面积", "评分"];
  const facilityMap = {
    酒店设施: ["免费WIFI", "健身房", "电视", "停车场"],
    客房设施: ["浴缸", "吹风机", "书桌", "咖啡机"],
    房间面积: ["20-25m2", "25-30m2", "30m2+"],
    评分: ["4.5以上", "4.0以上", "3.5以上"],
  };

  const dateLabel = useMemo(() => {
    const formatDate = (value?: string) => {
      if (!value) return "";
      const parts = value.split("-");
      if (parts.length !== 3) return value;
      return `${parts[1]}-${parts[2]}`;
    };
    const start = formatDate(params.checkIn);
    const end = formatDate(params.checkOut);
    if (start && end) {
      return `${start} - ${end} 1晚`;
    }
    return "选择日期";
  }, [params.checkIn, params.checkOut]);

  const cityLabel = decodeParam(params.city) || "城市";
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
            onInput={(event) => setKeyword(event.detail.value)}
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
                onInput={(event) => setKeyword(event.detail.value)}
                placeholder="位置/品牌/酒店"
                placeholderClass="filter-input__placeholder"
              />
            </View>
          </View>

          <View className="filter-section">
            <View className="filter-section__title">入住日期</View>
            <View className="filter-chip filter-chip--wide">
              <View>{dateLabel}</View>
              <ArrowDown color="#9aa4b2" width="12px" />
            </View>
          </View>

          <View className="filter-section">
            <View className="filter-section__title">选择客房和入住人数</View>
            <View className="filter-guest">
              <View className="filter-chip">
                <View>{roomCount}间房</View>
                <ArrowDown color="#9aa4b2" width="12px" />
              </View>
              <View className="filter-chip">
                <View>{adultCount}成人</View>
                <ArrowDown color="#9aa4b2" width="12px" />
              </View>
              <View className="filter-chip">
                <View>{childCount}儿童</View>
                <ArrowDown color="#9aa4b2" width="12px" />
              </View>
            </View>
            <View className="filter-stepper">
              <View className="filter-stepper__label">房间</View>
              <View className="filter-stepper__controls">
                <View
                  className={
                    roomCount <= 1
                      ? "filter-stepper__btn is-disabled"
                      : "filter-stepper__btn"
                  }
                  onClick={() =>
                    updateGuestCount(roomCount - 1, 1, 99, setRoomCount)
                  }
                >
                  -
                </View>
                <View className="filter-stepper__value">{roomCount}</View>
                <View
                  className="filter-stepper__btn"
                  onClick={() =>
                    updateGuestCount(roomCount + 1, 1, 99, setRoomCount)
                  }
                >
                  +
                </View>
              </View>
            </View>
            <View className="filter-stepper">
              <View className="filter-stepper__label">成人</View>
              <View className="filter-stepper__controls">
                <View
                  className={
                    adultCount <= 1
                      ? "filter-stepper__btn is-disabled"
                      : "filter-stepper__btn"
                  }
                  onClick={() =>
                    updateGuestCount(adultCount - 1, 1, 99, setAdultCount)
                  }
                >
                  -
                </View>
                <View className="filter-stepper__value">{adultCount}</View>
                <View
                  className="filter-stepper__btn"
                  onClick={() =>
                    updateGuestCount(adultCount + 1, 1, 99, setAdultCount)
                  }
                >
                  +
                </View>
              </View>
            </View>
            <View className="filter-stepper">
              <View className="filter-stepper__label">儿童</View>
              <View className="filter-stepper__controls">
                <View
                  className={
                    childCount <= 0
                      ? "filter-stepper__btn is-disabled"
                      : "filter-stepper__btn"
                  }
                  onClick={() =>
                    updateGuestCount(childCount - 1, 0, 99, setChildCount)
                  }
                >
                  -
                </View>
                <View className="filter-stepper__value">{childCount}</View>
                <View
                  className="filter-stepper__btn"
                  onClick={() =>
                    updateGuestCount(childCount + 1, 0, 99, setChildCount)
                  }
                >
                  +
                </View>
              </View>
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
            <View className="filter-section__title">城市</View>
            <View className="filter-city">
              {["上海", "苏州", "北京"].map((city) => (
                <View
                  key={city}
                  className={
                    city === selectedCity
                      ? "filter-city__item is-active"
                      : "filter-city__item"
                  }
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
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
