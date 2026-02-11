import React, { useMemo, useState } from "react";
import { Input, ScrollView, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

const CITY_STORAGE_KEY = "city_selected";
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
