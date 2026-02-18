import { Image, Map, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useMemo } from "react";
import quanjiImage from "../../../assets/imgs/quanji.png";
import rujiaImage from "../../../assets/imgs/rujia.png";
import "./index.scss";

const QQ_MAP_KEY = "IPIBZ-U3CKJ-UYQFM-DZX2P-XR7J2-GABWR";

const hotelMap = {
  "1": {
    id: "1",
    name: "如家商旅酒店(上海新国际博览中心店)",
    address: "上海浦东新区杨高南路1888号14号楼",
    rating: 4.6,
    price: 288,
    image: quanjiImage,
    facilities: ["空调", "餐厅", "游泳池", "24小时"],
    description:
      "如家商旅酒店(上海陆家嘴世博中心店)位于浦东陆家嘴金融贸易区核心商圈，散步于滨江步道可直达梅赛德斯，宋....",
  },
  "2": {
    id: "2",
    name: "全季酒店(上海长寿路地铁站店)",
    address: "上海市普陀区长寿路768号",
    rating: 4.9,
    price: 340,
    image: rujiaImage,
    facilities: ["洗衣房", "免费停车", "自助早餐", "24小时"],
    description:
      "全季酒店位于长寿路商圈，交通便利，周边美食与购物选择丰富，适合商务和休闲出行。",
  },
};
// 引入SDK核心类
const QQMapWX = require("../../utils/qqmap-wx-jssdk");

// 实例化API核心类
const qqmapsdk = new QQMapWX({
  key: QQ_MAP_KEY, // 必填
});

function DetailPage() {
  void qqmapsdk;
  const params = Taro.getCurrentInstance().router?.params || {};
  const hotel = useMemo(() => {
    const fallback = hotelMap["1"];
    return hotelMap[params.id as keyof typeof hotelMap] || fallback;
  }, [params.id]);

  const centerLongitude = 116.313972;
  const centerLatitude = 39.980014;
  const markers = useMemo(
    () => [
      {
        id: 1,
        longitude: centerLongitude,
        latitude: centerLatitude,
        width: 24,
        height: 24,
        iconPath: hotel.image,
      },
    ],
    [hotel.image],
  );

  const openFullscreenMap = () => {
    Taro.openLocation({
      longitude: centerLongitude,
      latitude: centerLatitude,
      name: hotel.name,
      address: hotel.address,
      scale: 16,
    });
  };

  return (
    <View className="detail-page">
      <View className="detail-hero">
        <Image
          className="detail-hero__image"
          src={hotel.image}
          mode="aspectFill"
        />
      </View>

      <View className="detail-card">
        <View className="detail-title">{hotel.name}</View>
        <View className="detail-meta">
          <View className="detail-meta__address">
            <View className="detail-meta__dot" />
            <View>{hotel.address}</View>
          </View>
          <View className="detail-meta__rating">
            <View className="detail-meta__star">★</View>
            <View>{hotel.rating}</View>
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section__title">酒店设施</View>
          <View className="detail-facilities">
            {hotel.facilities.map((item) => (
              <View className="detail-facility" key={item}>
                <View className="detail-facility__icon" />
                <View className="detail-facility__label">{item}</View>
              </View>
            ))}
            <View className="detail-facility detail-facility--more">
              <View className="detail-facility__icon" />
              <View className="detail-facility__label">设施政策</View>
            </View>
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section__title">酒店简介</View>
          <View className="detail-description">
            {hotel.description}
            <View className="detail-more">更多</View>
          </View>
        </View>

        <View className="detail-section">
          <View className="detail-section__row">
            <View className="detail-section__title">位置</View>
            <View
              className="detail-section__action"
              onClick={openFullscreenMap}
            >
              打开地图
            </View>
          </View>
          <Map
            id="myMap"
            className="detail-map"
            markers={markers}
            longitude={centerLongitude}
            latitude={centerLatitude}
            scale={16}
            onTap={openFullscreenMap}
            onError={() => {}}
          />
        </View>
      </View>

      <View className="detail-footer">
        <View>
          <View className="detail-footer__label">总价</View>
          <View className="detail-footer__price">¥{hotel.price}.00</View>
        </View>
        <View className="detail-footer__button">预定</View>
      </View>
    </View>
  );
}

export default DetailPage;
