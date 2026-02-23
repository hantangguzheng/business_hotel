import { useEffect, useMemo, useState } from "react";
import { Input, View } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { Elevator } from "@nutui/nutui-react-taro";
import {
  CITY_ADDRESS_KEY,
  CITY_LOCATION_INFO_KEY,
  CITY_STORAGE_KEY,
  MY_LOCATION_KEY,
  QQ_MAP_BASE_URL,
  QQ_MAP_KEY,
  QQ_MAP_SK,
} from "../../constants/app";
import "./index.scss";
const md5Module = require("../../utils/md5.js");
const md5: (input: string, key?: string, raw?: boolean) => string =
  typeof md5Module === "function" ? md5Module : md5Module?.default;
const { cities } = require("../../utils/city");

const buildTencentSig = (
  path: string,
  params: Record<string, string | number>,
) => {
  const query = Object.keys(params)
    .filter(
      (key) =>
        key !== "sig" && params[key] !== undefined && params[key] !== null,
    )
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
  return md5(`${path}?${query}${QQ_MAP_SK}`);
};

const toCityOption = (item) => ({
  name: item?.name || "",
  key: item?.key || "",
  cityCode: String(item?.cityCode || ""),
});

const HOT_CITIES = (cities.热门 || []).map(toCityOption);
const CITY_GROUPS = Object.keys(cities)
  .filter((key) => key !== "热门")
  .sort((a, b) => a.localeCompare(b))
  .map((key) => ({
    key,
    cities: (cities[key] || []).map(toCityOption),
  }));

const ALL_CITY_OPTIONS = CITY_GROUPS.flatMap((group) => group.cities);

type CityOption = {
  id: string;
  name: string;
  key?: string;
  cityCode: string;
};

function CityIndex() {
  const [query, setQuery] = useState("");
  const [elevatorHeight, setElevatorHeight] = useState(260);
  const [hasLocated, setHasLocated] = useState(false);
  const [locatedText, setLocatedText] = useState("");
  const [locatedCityInfo, setLocatedCityInfo] = useState<{
    name: string;
    key?: string;
    cityCode: string;
  } | null>(null);

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
    return matched;
  };

  const parseStoredCityInfo = (storedValue: unknown) => {
    if (!storedValue) return null;
    if (typeof storedValue === "string") return null;
    if (typeof storedValue !== "object") return null;
    const maybeCity = storedValue as {
      name?: string;
      key?: string;
      cityCode?: string;
    };
    if (!maybeCity?.name) return null;
    return {
      name: maybeCity.name,
      key: maybeCity.key,
      cityCode: String(maybeCity.cityCode || ""),
    };
  };

  const normalizeLocationAddress = (value?: string) => {
    const text = String(value || "").trim();
    return text.replace(/^我的位置[：:]\s*/, "");
  };

  useDidShow(() => {
    const storedCity = Taro.getStorageSync(CITY_STORAGE_KEY);
    const storedAddress = normalizeLocationAddress(
      Taro.getStorageSync(CITY_ADDRESS_KEY),
    );
    const storedCityInfo = parseStoredCityInfo(storedCity);
    const storedLocationCityInfo = parseStoredCityInfo(
      Taro.getStorageSync(CITY_LOCATION_INFO_KEY),
    );
    if (storedCityInfo) {
      setHasLocated(true);
      setLocatedCityInfo(storedCityInfo);
      setLocatedText(storedAddress || `${storedCityInfo.name}`);
      return;
    }

    if (storedCity === MY_LOCATION_KEY) {
      setHasLocated(true);
      setLocatedCityInfo(storedLocationCityInfo);
      setLocatedText(storedAddress || "我的位置");
      return;
    }

    setHasLocated(false);
    setLocatedCityInfo(null);
    setLocatedText("");
  });

  const updateElevatorHeight = () => {
    const systemInfo = Taro.getSystemInfoSync();
    const windowHeight = Number(systemInfo?.windowHeight || 0);
    if (!windowHeight) return;

    Taro.nextTick(() => {
      const queryInstance = Taro.createSelectorQuery();
      queryInstance
        .select(".city-search")
        .boundingClientRect()
        .select(".city-locate")
        .boundingClientRect()
        .select(".city-tabs")
        .boundingClientRect()
        .select(".city-section")
        .boundingClientRect()
        .exec((res) => {
          const heights = (res || []).map((item: any) =>
            Number(item?.height || 0),
          );
          const occupiedHeight = heights.reduce(
            (total, value) => total + value,
            0,
          );
          const extraSpacing = query ? 32 : 24;
          const availableHeight = Math.max(
            280,
            Math.floor(windowHeight - occupiedHeight - extraSpacing),
          );
          setElevatorHeight(availableHeight);
        });
    });
  };

  useEffect(() => {
    updateElevatorHeight();
  }, [query, hasLocated, locatedText]);

  const filteredGroups = useMemo(() => {
    if (!query) return CITY_GROUPS;
    return CITY_GROUPS.map((group) => ({
      ...group,
      cities: group.cities.filter((city) => city.name.includes(query)),
    })).filter((group) => group.cities.length > 0);
  }, [query]);

  const dataList = useMemo(
    () =>
      filteredGroups.map((group) => ({
        title: group.key,
        list: group.cities.map((city) => ({
          id: `${group.key}-${city.name}`,
          name: city.name,
          key: city.key,
          cityCode: String(city.cityCode || ""),
        })),
      })),
    [filteredGroups],
  );

  const handleSelect = (cityInfo) => {
    Taro.setStorageSync(CITY_STORAGE_KEY, cityInfo);
    Taro.setStorageSync(CITY_LOCATION_INFO_KEY, cityInfo);
    Taro.navigateBack();
  };

  const handleUseMyLocation = () => {
    Taro.setStorageSync(CITY_STORAGE_KEY, MY_LOCATION_KEY);
    if (locatedCityInfo) {
      Taro.setStorageSync(CITY_LOCATION_INFO_KEY, locatedCityInfo);
    }
    Taro.navigateBack();
  };

  const onItemClick = (key: string, item: CityOption) => {
    console.log(key, JSON.stringify(item));
    handleSelect({
      name: item.name,
      key: item.key,
      cityCode: String(item.cityCode || ""),
    });
  };

  const onIndexClick = (key: string) => {
    console.log(key);
  };

  const handleLocate = () => {
    Taro.getLocation({
      type: "gcj02",
      success: (res) => {
        const locationParam = `${res.latitude},${res.longitude}`;
        const geocoderData = {
          key: QQ_MAP_KEY,
          location: locationParam,
        };
        const sig = buildTencentSig("/ws/geocoder/v1", geocoderData);
        Taro.request({
          url: `${QQ_MAP_BASE_URL}/geocoder/v1`,
          data: {
            ...geocoderData,
            sig,
          },
          success: (response) => {
            const result = response?.data?.result;
            const geocoderCity =
              result?.address_component?.city ||
              result?.ad_info?.city ||
              result?.address_component?.district ||
              "";
            const matchedCityInfo = resolveCityInfoByName(geocoderCity);
            const address =
              result?.formatted_addresses?.recommend || result?.address;
            const text = address || "我的位置";
            setHasLocated(true);
            setLocatedText(text);
            if (matchedCityInfo) {
              const cityInfo = {
                name: matchedCityInfo.name,
                key: matchedCityInfo.key,
                cityCode: String(matchedCityInfo.cityCode || ""),
              };
              setLocatedCityInfo(cityInfo);
              Taro.setStorageSync(CITY_LOCATION_INFO_KEY, cityInfo);
            } else {
              setLocatedCityInfo(null);
            }
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

      <View className="city-scroll">
        {!query && (
          <View className="city-section">
            <View className="city-section__title">国内热门城市</View>
            <View className="city-grid">
              {HOT_CITIES.map((city) => (
                <View
                  key={city.name}
                  className="city-chip"
                  onClick={() => handleSelect(city)}
                >
                  {city.name}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="city-list">
          <Elevator
            list={dataList}
            height={elevatorHeight}
            spaceHeight={16}
            titleHeight={30}
            onItemClick={(key: string, item: CityOption) =>
              onItemClick(key, item)
            }
            onIndexClick={(key: string) => onIndexClick(key)}
          />
        </View>
      </View>
    </View>
  );
}

export default CityIndex;
