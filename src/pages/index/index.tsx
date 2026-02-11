import React, { useEffect, useMemo, useState } from "react";
import { Image, Input, Picker, View } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import Taro, { useDidShow } from "@tarojs/taro";
import { ArrowDown } from "@nutui/icons-react-taro";
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
  const MY_LOCATION_KEY = "__MY_LOCATION__";
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const copy = useMemo(() => (lang === "zh" ? zh : en), [lang]);
  const roomOptions = copy.roomOptions;
  const adultOptions = copy.adultOptions;
  const childOptions = copy.childOptions;

  const [location, setLocation] = useState("");
  const [locationKey, setLocationKey] = useState("");
  const [keyword, setKeyword] = useState("");
  const [locationNotice, setLocationNotice] = useState("");
  const [showLocationNotice, setShowLocationNotice] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomIndex, setRoomIndex] = useState(0);
  const [adultIndex, setAdultIndex] = useState(1);
  const [childIndex, setChildIndex] = useState(0);

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
          },
          fail: () => {
            const text = `${copy.myLocationText}：${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`;
            setLocationKey(MY_LOCATION_KEY);
            setLocation(copy.myLocationText);
            setLocationNotice(text);
            setShowLocationNotice(true);
            Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
          },
        });
      },
      fail: () => {
        setLocationNotice("定位失败，请检查定位权限");
        setShowLocationNotice(true);
      },
    });
  };

  const handleSearch = () => {
    const payload = {
      location,
      checkIn,
      checkOut,
      room: roomOptions[roomIndex],
      adult: adultOptions[adultIndex],
      child: childOptions[childIndex],
    };
    console.log("search", payload);
  };

  const formatDate = (value: string) => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
  };
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
              x
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
                {location || copy.locationPlaceholder}
              </View>
              <ArrowDown color="grey" />
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

        <View className="field field--row">
          <View className="field__half">
            <View className="field__label">{copy.checkInLabel}</View>
            <Picker
              mode="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.detail.value)}
            >
              <View className="field__input">
                <View className="field__icon">C</View>
                <View
                  className={checkIn ? "field__value" : "field__placeholder"}
                >
                  {checkIn ? formatDate(checkIn) : copy.datePlaceholder}
                </View>
              </View>
            </Picker>
          </View>
          <View className="field__half">
            <View className="field__label">{copy.checkOutLabel}</View>
            <Picker
              mode="date"
              value={checkOut}
              onChange={(event) => setCheckOut(event.detail.value)}
            >
              <View className="field__input">
                <View className="field__icon">C</View>
                <View
                  className={checkOut ? "field__value" : "field__placeholder"}
                >
                  {checkOut ? formatDate(checkOut) : copy.datePlaceholder}
                </View>
              </View>
            </Picker>
          </View>
        </View>

        <View className="field">
          <View className="field__label">{copy.guestLabel}</View>
          <View className="selector-row">
            <Picker
              mode="selector"
              range={roomOptions}
              value={roomIndex}
              onChange={(event) => setRoomIndex(Number(event.detail.value))}
            >
              <View className="selector-chip">
                <View className="field__icon">R</View>
                <View className="field__value">{roomOptions[roomIndex]}</View>
              </View>
            </Picker>
            <Picker
              mode="selector"
              range={adultOptions}
              value={adultIndex}
              onChange={(event) => setAdultIndex(Number(event.detail.value))}
            >
              <View className="selector-chip">
                <View className="field__icon">A</View>
                <View className="field__value">{adultOptions[adultIndex]}</View>
              </View>
            </Picker>
            <Picker
              mode="selector"
              range={childOptions}
              value={childIndex}
              onChange={(event) => setChildIndex(Number(event.detail.value))}
            >
              <View className="selector-chip">
                <View className="field__icon">K</View>
                <View className="field__value">{childOptions[childIndex]}</View>
              </View>
            </Picker>
          </View>
        </View>

        <Button className="search-button" type="primary" onClick={handleSearch}>
          {copy.searchText}
        </Button>
      </View>
    </View>
  );
}

export default Index;
