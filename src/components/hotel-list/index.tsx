import { Image, View } from "@tarojs/components";
import { StarFill } from "@nutui/icons-react-taro";
import { HOTEL_TAG_ICON_MAP } from "../../apis/tag_map";
import type { HotelListItem } from "../../apis/type";
import { FALLBACK_HOTEL_IMAGE_URL } from "../../constants/app";
import diamondIcon from "../../assets/imgs/diamond.svg";

type HotelPriceDisplay = {
  currentPrice: number;
  originalPrice: number;
  promotionLabel: string;
};

type HotelListProps = {
  loadingHotels: boolean;
  hotels: HotelListItem[];
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  nights: number;
  onOpenDetail: (hotelId: string | number) => void;
  formatDistance: (distance?: number) => string;
  getHotelPriceDisplay: (hotel: HotelListItem) => HotelPriceDisplay;
  formatHotelShortTag: (tag: string) => string;
};

function HotelList({
  loadingHotels,
  hotels,
  loadingMore,
  hasMore,
  totalCount,
  nights,
  onOpenDetail,
  formatDistance,
  getHotelPriceDisplay,
  formatHotelShortTag,
}: HotelListProps) {
  return (
    <>
      <View className="hotel-list">
        <View className="hotel-top_holder"></View>
        {loadingHotels && <View className="hotel-list__empty">加载中...</View>}
        {!loadingHotels && hotels.length === 0 && (
          <View className="hotel-list__empty">暂无符合条件的酒店</View>
        )}
        {!loadingHotels &&
          hotels.map((hotel) => {
            const distanceText = formatDistance(hotel.distance);
            const priceDisplay = getHotelPriceDisplay(hotel);
            const starCount = Math.max(
              0,
              Math.floor(
                Number(hotel.starRating ?? (hotel as any).star_rating) || 0,
              ),
            );

            return (
              <View
                className="hotel-card"
                key={hotel.id}
                onClick={() => onOpenDetail(hotel.id)}
              >
                <View className="hotel-card__media">
                  <Image
                    className="hotel-card__image"
                    src={hotel.imageUrls?.[0] || FALLBACK_HOTEL_IMAGE_URL}
                    mode="aspectFill"
                  />
                  <View className="hotel-card__rating">
                    <StarFill color="#ffd166" width="16px" />

                    <View>
                      {typeof hotel.score === "number"
                        ? hotel.score.toFixed(1)
                        : "--"}
                    </View>
                  </View>
                </View>
                <View className="hotel-card__body">
                  <View className="hotel-card__title">
                    <View className="hotel-card__title-text">
                      {hotel.nameCn || hotel.nameEn}
                    </View>
                    {Array.from({ length: starCount }).map((_, index) => (
                      <Image
                        key={`diamond-${hotel.id}-${index}`}
                        className="hotel-card__diamond"
                        src={diamondIcon}
                        mode="aspectFit"
                      />
                    ))}
                  </View>
                  <View className="hotel-card__row">
                    <View className="hotel-card__distance">
                      {distanceText ? (
                        <View className="hotel-card__distance-text">
                          {distanceText}
                        </View>
                      ) : null}
                      {hotel.address ? (
                        <>
                          {distanceText ? (
                            <View className="hotel-card__distance-dot" />
                          ) : null}
                          <View className="hotel-card__address">
                            {hotel.address}
                          </View>
                        </>
                      ) : null}
                    </View>
                    <View className="hotel-card__price">
                      {priceDisplay.originalPrice > 0 ? (
                        <View className="hotel-card__price-origin">
                          ¥{priceDisplay.originalPrice}
                        </View>
                      ) : null}
                      <View className="hotel-card__price-main">
                        <View className="hotel-card__price-main-sign">¥</View>
                        <View className="hotel-card__price-main-number">
                          {priceDisplay.currentPrice}
                        </View>
                        <View className="hotel-card__price-main-suffix">
                          起
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="hotel-card__row">
                    <View className="hotel-card__tags">
                      {(hotel.shortTags || []).slice(0, 3).map((tag) => {
                        const mappedIcon =
                          HOTEL_TAG_ICON_MAP[
                            tag as keyof typeof HOTEL_TAG_ICON_MAP
                          ]?.icon;
                        return (
                          <View className="hotel-card__tag" key={tag}>
                            {mappedIcon ? (
                              <Image
                                className="hotel-card__tag-icon"
                                src={mappedIcon}
                                mode="aspectFit"
                              />
                            ) : (
                              <View className="hotel-card__tag-icon hotel-card__tag-icon--placeholder" />
                            )}
                            <View>{formatHotelShortTag(tag)}</View>
                          </View>
                        );
                      })}
                    </View>
                    <View className="hotel-card__extra">
                      <View className="hotel-card__nights">{nights}晚</View>
                      {priceDisplay.promotionLabel ? (
                        <View className="hotel-card__promotion-tag">
                          {priceDisplay.promotionLabel}
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
      </View>

      {!loadingHotels && hotels.length > 0 && (
        <View className="hotel-list__footer">
          {loadingMore
            ? "加载更多中..."
            : hasMore
              ? `已加载${hotels.length}/${totalCount}，上拉加载更多`
              : `已加载全部${totalCount}条`}
        </View>
      )}
    </>
  );
}

export default HotelList;
