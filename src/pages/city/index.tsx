import React, { useMemo, useState } from "react";
import { Input, ScrollView, View } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import md5 from "../../../utils/md5.js";
import "./index.scss";

const CITY_STORAGE_KEY = "city_selected";
const CITY_ADDRESS_KEY = "city_address";
const MY_LOCATION_KEY = "__MY_LOCATION__";
const QQ_MAP_KEY = "IPIBZ-U3CKJ-UYQFM-DZX2P-XR7J2-GABWR";
const QQ_MAP_SK = "eReOMGZUU9rMnVbYphtudUST6EfMC7MC";
const { cities } = require("../../../utils/city");

const HOT_CITIES = (cities.热门 || []).map((item) => item.name);
const CITY_GROUPS = Object.keys(cities)
  .filter((key) => key !== "热门")
  .sort((a, b) => a.localeCompare(b))
  .map((key) => ({
    key,
    cities: (cities[key] || []).map((item) => item.name),
  }));

function CityIndex() {
  const [query, setQuery] = useState("");
  const [hasLocated, setHasLocated] = useState(false);
  const [locatedText, setLocatedText] = useState("");

  useDidShow(() => {
    const storedCity = Taro.getStorageSync(CITY_STORAGE_KEY);
    const storedAddress = Taro.getStorageSync(CITY_ADDRESS_KEY);
    if (storedCity === MY_LOCATION_KEY) {
      setHasLocated(true);
      setLocatedText(storedAddress || "我的位置");
    } else {
      setHasLocated(false);
      setLocatedText("");
    }
  });

  const filteredGroups = useMemo(() => {
    if (!query) return CITY_GROUPS;
    return CITY_GROUPS.map((group) => ({
      ...group,
      cities: group.cities.filter((city) => city.includes(query)),
    })).filter((group) => group.cities.length > 0);
  }, [query]);

  const handleSelect = (city: string) => {
    Taro.setStorageSync(CITY_STORAGE_KEY, city);
    Taro.navigateBack();
  };

  const handleUseMyLocation = () => {
    Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
    Taro.navigateBack();
  };

  const handleLocate = () => {
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
            const text = address || "我的位置";
            setHasLocated(true);
            setLocatedText(text);
            Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
            Taro.setStorageSync(CITY_ADDRESS_KEY, text);
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

  return (
    <View className="city-page">
      <View className="city-search">
        <View className="city-search__input">
          <Input
            value={query}
            onInput={(event) => setQuery(event.detail.value)}
            placeholder="全球城市/区域/位置/酒店"
            placeholderClass="city-search__placeholder"
          />
        </View>
        <View
          className="city-search__cancel"
          onClick={() => Taro.navigateBack()}
        >
          取消
        </View>
      </View>

      <View className="city-locate">
        <View className="city-locate__title">当前位置</View>
        {hasLocated ? (
          <View className="city-locate__row" onClick={handleUseMyLocation}>
            <View className="city-locate__dot" />
            <View className="city-locate__text">{locatedText}</View>
            <View className="city-locate__action">使用</View>
          </View>
        ) : (
          <View className="city-locate__row" onClick={handleLocate}>
            <View className="city-locate__dot" />
            <View className="city-locate__text">定位当前城市</View>
            <View className="city-locate__action">定位</View>
          </View>
        )}
      </View>

      <View className="city-tabs">
        <View className="city-tabs__item city-tabs__item--active">
          国内(含港澳台)
        </View>
        {/* <View className="city-tabs__item">海外</View>
        <View className="city-tabs__item">热门</View> */}
      </View>

      <ScrollView scrollY className="city-scroll">
        {!query && (
          <View className="city-section">
            <View className="city-section__title">国内热门城市</View>
            <View className="city-grid">
              {HOT_CITIES.map((city) => (
                <View
                  key={city}
                  className="city-chip"
                  onClick={() => handleSelect(city)}
                >
                  {city}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="city-list">
          {filteredGroups.map((group) => (
            <View key={group.key} className="city-group">
              <View className="city-group__title">{group.key}</View>
              {group.cities.map((city) => (
                <View
                  key={city}
                  className="city-item"
                  onClick={() => handleSelect(city)}
                >
                  {city}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default CityIndex;
