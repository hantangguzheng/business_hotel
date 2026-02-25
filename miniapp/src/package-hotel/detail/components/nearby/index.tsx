import { Image, Map, View } from "@tarojs/components";
import highlightIcon from "../../../../assets/imgs/highlight.svg";

type NearbyItem = {
  title: string;
  subtitle: string;
  icon: string;
};

type NearbySection = {
  key: "traffic" | "sight" | "food";
  label: string;
  items: NearbyItem[];
};

type NearbyProps = {
  hotelNear: string;
  hotelName: string;
  markers: any[];
  centerLongitude: number;
  centerLatitude: number;
  nearbySections: NearbySection[];
  onOpenFullscreenMap: () => void;
};

function Nearby({
  hotelNear,
  hotelName,
  markers,
  centerLongitude,
  centerLatitude,
  nearbySections,
  onOpenFullscreenMap,
}: NearbyProps) {
  return (
    <View className="detail-section">
      <View className="detail-section__row">
        <View className="detail-section__title">位置周边</View>
        <View className="detail-section__action" onClick={onOpenFullscreenMap}>
          打开地图
        </View>
      </View>
      <View className="detail-map-tabs">
        <View className="detail-map-tabs__item-title">
          <Image src={highlightIcon} className="detail-map-tabs__item-icon" />

          <View className="detail-map-tabs__item is-active">位置亮点</View>
        </View>

        <View className="detail-map-tabs__item">{hotelNear}</View>
      </View>
      <View className="detail-map-card">
        <View className="detail-map-card__container">
          <Map
            id="myMap"
            className="detail-map"
            markers={markers}
            longitude={centerLongitude}
            latitude={centerLatitude}
            scale={16}
            enableScroll={false}
            enableZoom={false}
            enableRotate={false}
            enableOverlooking={false}
            onTap={onOpenFullscreenMap}
            onError={() => {}}
          />
          <View className="detail-map-marker-label">{hotelName}</View>
        </View>
      </View>
      <View className="detail-nearby">
        {nearbySections.map((section) => (
          <View className="detail-nearby__section" key={section.key}>
            <View className="detail-nearby__label">{section.label}</View>
            <View className="detail-nearby__grid">
              {section.items.map((item, index) => (
                <View
                  className="detail-nearby__item"
                  key={`${section.key}-${item.title}-${index}`}
                >
                  <View className="detail-nearby__item-title-row">
                    <View className="detail-nearby__item-icon">
                      {item.icon}
                    </View>
                    <View className="detail-nearby__item-title">
                      {item.title}
                    </View>
                  </View>
                  <View className="detail-nearby__item-subtitle">
                    {item.subtitle}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default Nearby;
