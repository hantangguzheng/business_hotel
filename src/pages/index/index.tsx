import { useEffect, useMemo, useState } from "react";
import { Image, Input, View } from "@tarojs/components";
import { Button, Calendar, Cell, Popup } from "@nutui/nutui-react-taro";
import Taro, { useDidShow } from "@tarojs/taro";
import { ArrowDown, Close } from "@nutui/icons-react-taro";
import zh from "../../../locales/zh";
import en from "../../../locales/en";
import logo from "../../../assets/imgs/logo.png";
import md5 from "../../../utils/md5.js";
import "./index.scss";
const QQ_MAP_KEY = "IPIBZ-U3CKJ-UYQFM-DZX2P-XR7J2-GABWR";
const QQ_MAP_SK = "eReOMGZUU9rMnVbYphtudUST6EfMC7MC";
function Index() {
  const LANG_STORAGE_KEY = "app_lang";
  const CITY_STORAGE_KEY = "city_selected";
  const CITY_ADDRESS_KEY = "city_address";
  const MY_LOCATION_KEY = "__MY_LOCATION__";
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const copy = useMemo(() => (lang === "zh" ? zh : en), [lang]);

  const [location, setLocation] = useState("");
  const [locationKey, setLocationKey] = useState("");
  const [keyword, setKeyword] = useState("");
  const [locationNotice, setLocationNotice] = useState("");
  const [showLocationNotice, setShowLocationNotice] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [dateRange, setDateRange] = useState<string[]>([]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [roomCount, setRoomCount] = useState(1);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [guestVisible, setGuestVisible] = useState(false);
  const keywordTags = ["适合情侣", "上海浦东国际机场", "上榜酒店", "国家会展"];

  useDidShow(() => {
    const storedLang = Taro.getStorageSync(LANG_STORAGE_KEY);
    if (storedLang === "en" || storedLang === "zh") {
      setLang(storedLang);
    }
    const storedCity = Taro.getStorageSync(CITY_STORAGE_KEY);
    if (storedCity) {
      if (storedCity === MY_LOCATION_KEY) {
        setLocationKey(MY_LOCATION_KEY);
        setLocation(copy.myLocationText);
      } else {
        setLocationKey("CITY");
        setLocation(storedCity);
      }
    }
  });

  useEffect(() => {
    if (locationKey === MY_LOCATION_KEY) {
      setLocation(copy.myLocationText);
    }
  }, [copy.myLocationText, locationKey]);

  const handleToggleLang = () => {
    setLang((current) => {
      const next = current === "zh" ? "en" : "zh";
      Taro.setStorageSync(LANG_STORAGE_KEY, next);
      return next;
    });
  };

  const handleOpenCity = () => {
    Taro.navigateTo({ url: "/pages/city/index" });
  };

  const handleLocate = (event) => {
    event.stopPropagation();
    Taro.getLocation({
      type: "gcj02",
      success: (res) => {
        const locationParam = `${res.latitude},${res.longitude}`;
        const sig = md5(
          `/ws/geocoder/v1?key=${QQ_MAP_KEY}&location=${locationParam}${QQ_MAP_SK}`,
        );
        Taro.request({
          url: "https://apis.map.qq.com/ws/geocoder/v1",
          data: {
            key: QQ_MAP_KEY,
            location: locationParam,
            sig,
          },
          success: (response) => {
            console.log(response);
            const result = response?.data?.result;
            const address =
              result?.formatted_addresses?.recommend || result?.address;
            const text = address
              ? `${copy.myLocationText}：${address}`
              : `${copy.myLocationText}：${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`;
            setLocationKey(MY_LOCATION_KEY);
            setLocation(copy.myLocationText);
            setLocationNotice(text);
            setShowLocationNotice(true);
            Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
            Taro.setStorageSync(CITY_ADDRESS_KEY, text);
          },
          fail: () => {
            const text = `${copy.myLocationText}：${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`;
            setLocationKey(MY_LOCATION_KEY);
            setLocation(copy.myLocationText);
            setLocationNotice(text);
            setShowLocationNotice(true);
            Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
            Taro.setStorageSync(CITY_ADDRESS_KEY, text);
          },
        });
      },
      fail: () => {
        setLocationNotice("定位失败，请检查定位权限");
        setShowLocationNotice(true);
      },
    });
  };

  const handleSearch = (nextKeyword?: string) => {
    const payload = {
      location,
      checkIn,
      checkOut,
      room: roomCount,
      adult: adultCount,
      child: childCount,
      keyword: nextKeyword ?? keyword,
    };
    console.log("search", payload);
  };

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    handleSearch(tag);
  };

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

  const formatDate = (value: string) => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    return `${parts[1]}月${parts[2]}日`;
  };

  const buildDefaultDatePlaceholder = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const formatShort = (date: Date) => {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return lang === "zh" ? `${month}月${day}日` : `${month}/${day}`;
    };
    return `${formatShort(today)}至${formatShort(tomorrow)}`;
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
    setCheckIn(startValue);
    setCheckOut(endValue);
    setCalendarVisible(false);
  };

  const updateGuestCount = (nextValue, minValue, maxValue, setter) => {
    const max = typeof maxValue === "number" ? maxValue : 99;
    const min = typeof minValue === "number" ? minValue : 0;
    const safeValue = Math.max(min, Math.min(max, nextValue));
    setter(safeValue);
  };

  const dateDescription =
    dateRange.length === 2 && dateRange[0] && dateRange[1]
      ? `${formatDate(dateRange[0])}至${formatDate(dateRange[1])}`
      : buildDefaultDatePlaceholder();

  return (
    <View className="hotel-page">
      <View className="lang-toggle" onClick={handleToggleLang}>
        <Image
          className="lang-toggle__icon"
          src="https://img14.360buyimg.com/imagetools/jfs/t1/135168/8/21387/6193/625fa81aEe07cc347/55ad5bc2580c53a6.png"
          mode="aspectFit"
        />
        <View className="lang-toggle__text">{copy.toggleText}</View>
      </View>
      <View className="hero">
        {/* <View className="hero__title">{copy.heroTitle}</View> */}
      </View>
      <View className="card">
        <View className="card__header">
          <Image src={logo} className="card__logo" mode="aspectFit" />
          <View className="card__title">{copy.cardTitle}</View>
          <View className="card__subtitle">{copy.cardSubtitle}</View>
        </View>

        {showLocationNotice && (
          <View className="location-notice">
            <View className="location-notice__dot" />
            <View className="location-notice__text">{locationNotice}</View>
            <View
              className="location-notice__close"
              onClick={(event) => {
                event.stopPropagation();
                setShowLocationNotice(false);
              }}
            >
              <Close color="grey" width="12px" />
            </View>
          </View>
        )}

        <View className="location-row">
          <View className="location-col" onClick={handleOpenCity}>
            <View className="location-col__label">{copy.locationLabel}</View>
            <View className="location-col__main">
              <View
                className={
                  location ? "location-col__value" : "location-col__placeholder"
                }
              >
                {location || copy.cityDefault}
              </View>
              <ArrowDown color="grey" width="10px" />
              <View className="location-col__locate" onClick={handleLocate}>
                <View className="location-col__locate-dot" />
              </View>
            </View>
          </View>
          <View className="location-divider" />
          <View className="keyword-col">
            <View className="keyword-col__label">{copy.keywordLabel}</View>
            <View className="keyword-col__input">
              <Input
                value={keyword}
                onInput={(event) => setKeyword(event.detail.value)}
                placeholder={copy.keywordPlaceholder}
                placeholderClass="input-placeholder"
              />
            </View>
          </View>
        </View>

        <Cell
          title={
            <View className="date-range-cell__title">{`${copy.checkInLabel} - ${copy.checkOutLabel}`}</View>
          }
          description={
            <View className="date-range-cell__description">
              {dateDescription}
            </View>
          }
          onClick={() => setCalendarVisible(true)}
          className="date-range-cell"
        />

        <Calendar
          visible={calendarVisible}
          defaultValue={dateRange}
          type="range"
          onClose={() => setCalendarVisible(false)}
          onConfirm={handleCalendarConfirm}
        />

        <View className="guest-row" onClick={() => setGuestVisible(true)}>
          <View className="guest-row__label">{copy.guestLabel}</View>
          <View className="guest-row__value">
            {roomCount}间房 {adultCount}成人 {childCount}儿童
          </View>
          <ArrowDown color="#9aa4b2" width="10px" />
        </View>

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
              <View className="guest-popup__title">{copy.guestLabel}</View>
            </View>
            <View className="guest-popup__tips">
              入住人数较多时，试试增加间数
            </View>
            <View className="guest-popup__item">
              <View className="guest-popup__item-label">间数</View>
              <View className="guest-stepper">
                <View
                  className={
                    roomCount <= 1
                      ? "guest-stepper__btn is-disabled"
                      : "guest-stepper__btn"
                  }
                  onClick={() =>
                    updateGuestCount(roomCount - 1, 1, 99, setRoomCount)
                  }
                >
                  -
                </View>
                <View className="guest-stepper__value">{roomCount}</View>
                <View
                  className="guest-stepper__btn"
                  onClick={() =>
                    updateGuestCount(roomCount + 1, 1, 99, setRoomCount)
                  }
                >
                  +
                </View>
              </View>
            </View>
            <View className="guest-popup__item">
              <View className="guest-popup__item-label">成人数</View>
              <View className="guest-stepper">
                <View
                  className={
                    adultCount <= 1
                      ? "guest-stepper__btn is-disabled"
                      : "guest-stepper__btn"
                  }
                  onClick={() =>
                    updateGuestCount(adultCount - 1, 1, 99, setAdultCount)
                  }
                >
                  -
                </View>
                <View className="guest-stepper__value">{adultCount}</View>
                <View
                  className="guest-stepper__btn"
                  onClick={() =>
                    updateGuestCount(adultCount + 1, 1, 99, setAdultCount)
                  }
                >
                  +
                </View>
              </View>
            </View>
            <View className="guest-popup__item">
              <View className="guest-popup__item-label">
                儿童数
                <View className="guest-popup__item-sub">0-17岁</View>
              </View>
              <View className="guest-stepper">
                <View
                  className={
                    childCount <= 0
                      ? "guest-stepper__btn is-disabled"
                      : "guest-stepper__btn"
                  }
                  onClick={() =>
                    updateGuestCount(childCount - 1, 0, 99, setChildCount)
                  }
                >
                  -
                </View>
                <View className="guest-stepper__value">{childCount}</View>
                <View
                  className="guest-stepper__btn"
                  onClick={() =>
                    updateGuestCount(childCount + 1, 0, 99, setChildCount)
                  }
                >
                  +
                </View>
              </View>
            </View>
            <Button
              className="guest-popup__confirm"
              type="primary"
              onClick={() => setGuestVisible(false)}
            >
              完成
            </Button>
          </View>
        </Popup>

        <View className="keyword-tags">
          {keywordTags.map((tag) => (
            <View
              key={tag}
              className="keyword-tags__item"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </View>
          ))}
        </View>

        <Button
          className="search-button"
          type="primary"
          onClick={() => handleSearch()}
        >
          {copy.searchText}
        </Button>
      </View>
    </View>
  );
}

export default Index;
