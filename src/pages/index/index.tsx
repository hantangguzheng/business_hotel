import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Input, Swiper, SwiperItem, View } from "@tarojs/components";
import { Button, Calendar, Cell, Popup } from "@nutui/nutui-react-taro";
import Taro, { useDidShow } from "@tarojs/taro";
import { ArrowDown, Close } from "@nutui/icons-react-taro";
import GuestSelector from "../../components/guest-selector";
import PriceStarPopup from "../../components/price-star-popup";
import { getHotelDetail } from "../../apis/hotels";
import { useSharedFilter } from "../../store/filter-context";
import zh from "../../locales/zh";
import en from "../../locales/en";
import logo from "../../assets/imgs/logo.png";
import bannerHotel1 from "../../assets/imgs/banner_hotel_1.png";
import bannerHotel2 from "../../assets/imgs/banner_hotel_2.png";
import bannerHotel3 from "../../assets/imgs/banner_hotel_3.png";
import "./index.scss";
const { cities } = require("../../utils/city");
const md5Module = require("../../utils/md5.js");
const md5: (input: string, key?: string, raw?: boolean) => string =
  typeof md5Module === "function" ? md5Module : md5Module?.default;
const QQ_MAP_KEY = "IPIBZ-U3CKJ-UYQFM-DZX2P-XR7J2-GABWR";
const QQ_MAP_SK = "eReOMGZUU9rMnVbYphtudUST6EfMC7MC";
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000000;
const DEFAULT_MIN_STAR = 2;
const DEFAULT_MAX_STAR = 5;

const DEFAULT_CITY_INFO = {
  name: "上海",
  cityCode: "2",
};

const BANNER_ITEMS = [
  { src: bannerHotel1, hotelId: 63 },
  { src: bannerHotel2, hotelId: 38 },
  { src: bannerHotel3, hotelId: 17 },
];

const collectCityOptions = () => {
  const groups = Object.keys(cities || {});
  const dedupe = new Map();

  groups.forEach((groupKey) => {
    const groupCities = cities[groupKey] || [];
    groupCities.forEach((item) => {
      const name = item?.name;
      if (!name || dedupe.has(name)) return;
      dedupe.set(name, {
        name,
        key: item?.key,
        cityCode: String(item?.cityCode || ""),
      });
    });
  });

  return Array.from(dedupe.values());
};

const ALL_CITY_OPTIONS = collectCityOptions();
function Index() {
  const LANG_STORAGE_KEY = "app_lang";
  const CITY_STORAGE_KEY = "city_selected";
  const CITY_LOCATION_INFO_KEY = "city_location_info";
  const CITY_ADDRESS_KEY = "city_address";
  const MY_LOCATION_KEY = "__MY_LOCATION__";
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const copy = useMemo(() => (lang === "zh" ? zh : en), [lang]);
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

  const [locationKey, setLocationKey] = useState("CITY");
  const [locationNotice, setLocationNotice] = useState("");
  const [showLocationNotice, setShowLocationNotice] = useState(false);
  const [dateRange, setDateRange] = useState<string[]>([checkIn, checkOut]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [guestVisible, setGuestVisible] = useState(false);
  const [priceStarVisible, setPriceStarVisible] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minStar, setMinStar] = useState<number | undefined>(undefined);
  const [maxStar, setMaxStar] = useState<number | undefined>(undefined);
  const [bannerHeight, setBannerHeight] = useState(180);
  const hasAutoLocatedRef = useRef(false);
  const keywordTags = [
    "4.7分以上",
    "自助早餐",
    "新开业",
    "双床房",
    "自助入住",
    "暖气",
  ];

  const resolveCityInfoByName = (name?: string) => {
    if (!name) return undefined;
    const normalizedName = name.replace(/市$/, "").trim();
    const matched = ALL_CITY_OPTIONS.find((item) => {
      const optionName = String(item.name || "")
        .replace(/市$/, "")
        .trim();
      return optionName === normalizedName;
    });
    if (!matched) return undefined;
    return {
      name: matched.name,
      cityCode: String(matched.cityCode || ""),
    };
  };

  const resolveCityInfoByCode = (targetCityCode?: string) => {
    const code = String(targetCityCode || "").trim();
    if (!code) return undefined;
    const matched = ALL_CITY_OPTIONS.find(
      (item) => String(item.cityCode || "") === code,
    );
    if (!matched) return undefined;
    return {
      name: matched.name,
      cityCode: String(matched.cityCode || ""),
    };
  };

  const parseStoredCityInfo = (storedValue: unknown) => {
    if (!storedValue) return undefined;

    if (typeof storedValue === "string") {
      if (storedValue === MY_LOCATION_KEY) return undefined;
      const fromName = resolveCityInfoByName(storedValue);
      if (fromName) return fromName;
      return { name: storedValue, cityCode: "" };
    }

    if (typeof storedValue === "object") {
      const maybeCity = storedValue as { name?: string; cityCode?: string };
      if (!maybeCity?.name) return undefined;
      return {
        name: maybeCity.name,
        cityCode: String(maybeCity.cityCode || ""),
      };
    }

    return undefined;
  };

  useDidShow(() => {
    const storedLang = Taro.getStorageSync(LANG_STORAGE_KEY);
    if (storedLang === "en" || storedLang === "zh") {
      setLang(storedLang);
    }
    const storedCity = Taro.getStorageSync(CITY_STORAGE_KEY);
    const storedCityInfo = parseStoredCityInfo(storedCity);
    const storedLocationCityInfo = parseStoredCityInfo(
      Taro.getStorageSync(CITY_LOCATION_INFO_KEY),
    );

    if (storedCity === MY_LOCATION_KEY) {
      setLocationKey(MY_LOCATION_KEY);
      const fallbackCityInfo =
        storedLocationCityInfo ||
        (city ? { name: city, cityCode: cityCode || "" } : DEFAULT_CITY_INFO);
      setFilter({
        city: fallbackCityInfo.name,
        cityCode: fallbackCityInfo.cityCode,
      });
    } else if (storedCityInfo) {
      setLocationKey("CITY");
      setFilter({
        city: storedCityInfo.name,
        cityCode: storedCityInfo.cityCode,
      });
    } else if (!city) {
      setFilter({
        city: DEFAULT_CITY_INFO.name,
        cityCode: DEFAULT_CITY_INFO.cityCode,
      });
    }

    if (!hasAutoLocatedRef.current) {
      hasAutoLocatedRef.current = true;
      locateUser();
    }
  });

  useEffect(() => {
    if (locationKey === MY_LOCATION_KEY && !city) {
      setFilter({
        city: DEFAULT_CITY_INFO.name,
        cityCode: DEFAULT_CITY_INFO.cityCode,
      });
    }
  }, [city, locationKey, setFilter]);

  useEffect(() => {
    setDateRange([checkIn, checkOut]);
  }, [checkIn, checkOut]);

  useEffect(() => {
    const updateBannerHeight = () => {
      Taro.getImageInfo({
        src: bannerHotel1,
        success: (imageInfo) => {
          const imageWidth = Number(imageInfo?.width || 0);
          const imageHeight = Number(imageInfo?.height || 0);
          const windowWidth = Number(Taro.getSystemInfoSync().windowWidth || 0);

          if (imageWidth <= 0 || imageHeight <= 0 || windowWidth <= 0) return;
          const nextHeight = Math.round(
            (windowWidth * imageHeight) / imageWidth,
          );
          if (nextHeight > 0) {
            setBannerHeight(nextHeight);
          }
        },
      });
    };

    updateBannerHeight();
  }, []);

  const handleOpenCity = () => {
    Taro.navigateTo({ url: "/pages/city/index" });
  };

  const locateUser = () => {
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
            const geocoderCity =
              result?.address_component?.city ||
              result?.ad_info?.city ||
              result?.address_component?.district ||
              "";
            const resolvedCityInfo =
              resolveCityInfoByName(geocoderCity) || DEFAULT_CITY_INFO;
            const address =
              result?.formatted_addresses?.recommend || result?.address;
            const rawAddress = address
              ? String(address)
              : `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`;
            const text = `${copy.myLocationText}：${rawAddress}`;
            setLocationKey(MY_LOCATION_KEY);
            setFilter({
              city: resolvedCityInfo.name,
              cityCode: resolvedCityInfo.cityCode,
              userLat: res.latitude,
              userLng: res.longitude,
            });
            setLocationNotice(text);
            setShowLocationNotice(true);
            Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
            Taro.setStorageSync(CITY_LOCATION_INFO_KEY, resolvedCityInfo);
            Taro.setStorageSync(CITY_ADDRESS_KEY, rawAddress);
          },
          fail: () => {
            const rawAddress = `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`;
            const text = `${copy.myLocationText}：${rawAddress}`;
            const fallbackCityInfo = DEFAULT_CITY_INFO;
            setLocationKey(MY_LOCATION_KEY);
            setFilter({
              city: fallbackCityInfo.name,
              cityCode: fallbackCityInfo.cityCode,
              userLat: res.latitude,
              userLng: res.longitude,
            });
            setLocationNotice(text);
            setShowLocationNotice(true);
            Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
            Taro.setStorageSync(CITY_LOCATION_INFO_KEY, fallbackCityInfo);
            Taro.setStorageSync(CITY_ADDRESS_KEY, rawAddress);
          },
        });
      },
      fail: () => {
        setLocationNotice("定位失败，请检查定位权限");
        setShowLocationNotice(true);
      },
    });
  };

  const handleLocate = (event) => {
    event.stopPropagation();
    locateUser();
  };

  const buildSearchUrl = (nextKeyword?: string, quickTag?: string) => {
    const safeRoomsNeeded = roomCount > 0 ? roomCount : 1;
    const safePeopleNeeded = Math.max(1, adultCount + childCount);
    const params = {
      city,
      cityCode,
      keyword: nextKeyword ?? keyword,
      quickTag: quickTag || undefined,
      minPrice: typeof minPrice === "number" ? minPrice : DEFAULT_MIN_PRICE,
      maxPrice: typeof maxPrice === "number" ? maxPrice : DEFAULT_MAX_PRICE,
      minStar: typeof minStar === "number" ? minStar : DEFAULT_MIN_STAR,
      maxStar: typeof maxStar === "number" ? maxStar : DEFAULT_MAX_STAR,
      checkIn,
      checkOut,
      roomsNeeded: String(safeRoomsNeeded),
      peopleNeeded: String(safePeopleNeeded),
      room: String(roomCount),
      adult: String(adultCount),
      child: String(childCount),
    };
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");
    return `/pages/list/index?${query}`;
  };

  const showMissingField = (message: string) => {
    Taro.showModal({
      title: "提示",
      content: message,
      showCancel: false,
    });
  };

  const validateSearch = () => {
    if (!city) {
      showMissingField("请选择酒店位置");
      return false;
    }
    if (!checkIn || !checkOut) {
      showMissingField("请选择入住和离开日期");
      return false;
    }
    if (!roomCount || roomCount < 1) {
      showMissingField("请选择客房数量");
      return false;
    }
    return true;
  };

  const handleSearch = (nextKeyword?: string, quickTag?: string) => {
    if (!validateSearch()) {
      return;
    }
    const safeRoomsNeeded = roomCount > 0 ? roomCount : 1;
    const safePeopleNeeded = Math.max(1, adultCount + childCount);
    const payload = {
      location: city,
      cityCode,
      checkIn,
      checkOut,
      roomsNeeded: safeRoomsNeeded,
      peopleNeeded: safePeopleNeeded,
      minPrice: typeof minPrice === "number" ? minPrice : DEFAULT_MIN_PRICE,
      maxPrice: typeof maxPrice === "number" ? maxPrice : DEFAULT_MAX_PRICE,
      minStar: typeof minStar === "number" ? minStar : DEFAULT_MIN_STAR,
      maxStar: typeof maxStar === "number" ? maxStar : DEFAULT_MAX_STAR,
      keyword: nextKeyword ?? keyword,
      quickTag: quickTag || undefined,
    };
    console.log("search", payload);
    Taro.navigateTo({ url: buildSearchUrl(nextKeyword, quickTag) });
  };

  const handleTagClick = (tag: string) => {
    handleSearch(undefined, tag);
  };

  const handleBannerClick = async (hotelId: number) => {
    try {
      const hotelDetail = await getHotelDetail(hotelId, checkIn, checkOut);
      const nextCityCode = String(hotelDetail?.cityCode || "").trim();
      const cityInfoByCode = resolveCityInfoByCode(nextCityCode);

      setFilter({
        cityCode: nextCityCode || cityCode,
        city: cityInfoByCode?.name || city,
      });
    } catch (error) {
      // ignore fetch error and continue navigation
    }

    Taro.navigateTo({ url: `/pages/detail/index?id=${hotelId}` });
  };

  const resolveInputValue = (event) => {
    return event?.detail?.value ?? event?.target?.value ?? "";
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
    setFilter({ checkIn: startValue, checkOut: endValue });
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

  const priceStarDescription = useMemo(() => {
    const priceText =
      typeof minPrice === "number"
        ? typeof maxPrice === "number"
          ? `¥${minPrice}-¥${maxPrice}`
          : `¥${minPrice}以上`
        : "价格/星级";

    const starText =
      typeof minStar === "number"
        ? typeof maxStar === "number" && maxStar >= minStar
          ? minStar === maxStar
            ? `${minStar}钻/星`
            : `${minStar}-${maxStar}钻/星`
          : `${minStar}钻/星起`
        : "";
    return starText ? `${priceText} ${starText}` : priceText;
  }, [maxPrice, maxStar, minPrice, minStar]);

  const locationDisplayText =
    locationKey === MY_LOCATION_KEY
      ? copy.myLocationText
      : city || copy.cityDefault;

  return (
    <View className="hotel-page">
      {/* <View className="lang-toggle" onClick={handleToggleLang}>
        <Image
          className="lang-toggle__icon"
          src="https://img14.360buyimg.com/imagetools/jfs/t1/135168/8/21387/6193/625fa81aEe07cc347/55ad5bc2580c53a6.png"
          mode="aspectFit"
        />
        <View className="lang-toggle__text">{copy.toggleText}</View>
      </View> */}
      <View className="banner" style={{ height: `${bannerHeight}px` }}>
        <Swiper
          className="banner__swiper"
          circular
          autoplay
          interval={3500}
          duration={500}
          indicatorDots
        >
          {BANNER_ITEMS.map((item, index) => (
            <SwiperItem
              key={`banner-${item.hotelId}`}
              onClick={() => handleBannerClick(item.hotelId)}
            >
              <Image
                className="banner__image"
                src={item.src}
                mode={index === 0 ? "aspectFit" : "aspectFill"}
              />
            </SwiperItem>
          ))}
        </Swiper>
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
                  locationDisplayText
                    ? "location-col__value"
                    : "location-col__placeholder"
                }
              >
                {locationDisplayText || copy.cityDefault}
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
                onInput={(event) =>
                  setFilter({ keyword: resolveInputValue(event) })
                }
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

        <View className="guest-and-star">
          <View className="guest-row" onClick={() => setGuestVisible(true)}>
            <View className="guest-row__main">
              <View className="guest-row__value">
                {roomCount}间房 {adultCount}成人 {childCount}儿童
              </View>
              <ArrowDown color="#9aa4b2" width="10px" />
            </View>
          </View>
          <View className="guest-star-divider" />
          <View className="star-row" onClick={() => setPriceStarVisible(true)}>
            <View className="star-row__label">{copy.starLabel}</View>
            <View className="star-row__main">
              <View className="star-row__value">{priceStarDescription}</View>
              <ArrowDown color="#9aa4b2" width="10px" />
            </View>
          </View>
        </View>

        <Popup
          visible={priceStarVisible}
          position="bottom"
          onClose={() => setPriceStarVisible(false)}
        >
          <View className="home-price-star-popup">
            <View className="home-price-star-popup__header">
              <View
                className="home-price-star-popup__close"
                onClick={() => setPriceStarVisible(false)}
              >
                <Close color="#1b2a4e" width="16px" />
              </View>
              <View className="home-price-star-popup__title">
                选择价格/星级
              </View>
            </View>
            <PriceStarPopup
              initialValue={{ minPrice, maxPrice, minStar, maxStar }}
              onConfirm={(value) => {
                setMinPrice(value.minPrice);
                setMaxPrice(value.maxPrice);
                setMinStar(value.minStar);
                setMaxStar(value.maxStar);
                setPriceStarVisible(false);
              }}
            />
          </View>
        </Popup>

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
