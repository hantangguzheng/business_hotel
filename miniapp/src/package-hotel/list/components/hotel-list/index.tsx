import { Image, View, ScrollView } from "@tarojs/components";
import { useCallback, useRef } from "react";
import { StarFill } from "@nutui/icons-react-taro";
import {
  HOTEL_TAG_ICON_MAP,
  HOTEL_DB_TO_CN_TAG_MAP,
  PROMOTION_TO_CN_MAP,
} from "../../../../apis/tag_map";
import type { HotelListItem, PromotionItem } from "../../../../apis/type";
import { FALLBACK_HOTEL_IMAGE_URL } from "../../../../constants/app";
import diamondIcon from "../../../../assets/imgs/diamond.svg";

type HotelListProps = {
  loadingHotels: boolean;
  hotels: HotelListItem[];
  loadingMore: boolean;
  hasMore: boolean;
  nights: number;
  onOpenDetail: (hotelId: string | number) => void;
  onLoadMore?: () => void;
  formatDistance: (distance?: number) => string;
};

// TODO: consider swapping ScrollView out for a virtualized list
// when hotel arrays grow very large (react-window/react-virtualized, etc.)

function HotelList({
  loadingHotels,
  hotels,
  loadingMore,
  hasMore,
  nights,
  onOpenDetail,
  onLoadMore,
  formatDistance,
}: HotelListProps) {
  const lastTriggerRef = useRef<number>(0);
  const THROTTLE_MS = 300;

  const handleScrollToLower = useCallback(() => {
    const now = Date.now();
    if (now - lastTriggerRef.current < THROTTLE_MS) return;
    lastTriggerRef.current = now;

    if (loadingMore || !hasMore) return;
    onLoadMore?.();
  }, [loadingMore, hasMore, onLoadMore]);

  const formatHotelShortTag = (tag: string) => {
    return (
      HOTEL_DB_TO_CN_TAG_MAP[tag as keyof typeof HOTEL_DB_TO_CN_TAG_MAP] || tag
    );
  };

  const getActivePromotion = (hotel: HotelListItem) => {
    const promotions = Array.isArray(hotel.promotions) ? hotel.promotions : [];
    if (promotions.length === 0) return null;

    const now = Date.now();
    const activePromotions = promotions.filter((item: PromotionItem) => {
      const start = new Date(item.startDate).getTime();
      const end = new Date(item.endDate).getTime();
      if (Number.isNaN(start) || Number.isNaN(end)) return false;
      return start <= now && now <= end;
    });

    if (activePromotions.length === 0) return null;

    return activePromotions.reduce<PromotionItem | null>((best, current) => {
      const bestDiscount = Number(best?.discount || 1);
      const currentDiscount = Number(current.discount || 1);
      if (!best) return current;
      return currentDiscount < bestDiscount ? current : best;
    }, null);
  };

  const formatPromotionLabel = (promotion: PromotionItem) => {
    const baseLabel =
      PROMOTION_TO_CN_MAP[promotion.promotionType] || promotion.promotionType;
    const discount = Number(promotion.discount || 0);
    if (!(discount > 0 && discount < 1)) return baseLabel;

    const fold = discount * 10;
    const foldText = Number.isInteger(fold) ? String(fold) : fold.toFixed(1);
    return `${baseLabel} | ${foldText}折`;
  };

  const getHotelPriceDisplay = (hotel: HotelListItem) => {
    const normalPrice =
      typeof hotel.price === "number" && Number.isFinite(hotel.price)
        ? hotel.price
        : 0;
    const crossLinePrice =
      typeof hotel.crossLinePrice === "number" &&
      Number.isFinite(hotel.crossLinePrice)
        ? hotel.crossLinePrice
        : 0;

    const activePromotion = getActivePromotion(hotel);
    if (!activePromotion) {
      return {
        currentPrice: normalPrice,
        originalPrice: crossLinePrice > normalPrice ? crossLinePrice : 0,
        promotionLabel: "",
      };
    }

    const discount = Number(activePromotion.discount || 0);
    const basePrice = crossLinePrice > 0 ? crossLinePrice : normalPrice;
    if (!(discount > 0 && discount < 1) || basePrice <= 0) {
      return {
        currentPrice: normalPrice,
        originalPrice: crossLinePrice > normalPrice ? crossLinePrice : 0,
        promotionLabel: formatPromotionLabel(activePromotion),
      };
    }

    const discountPrice = Math.max(1, Math.round(basePrice * discount));

    return {
      currentPrice: discountPrice,
      originalPrice: basePrice,
      promotionLabel: formatPromotionLabel(activePromotion),
    };
  };
  return (
    <ScrollView
      className="hotel-list-scroll-view"
      scrollY
      scrollWithAnimation
      lowerThreshold={250}
      onScrollToLower={handleScrollToLower}
      style={{ height: "100vh" }}
    >
      <View className="hotel-list">
        <View className="hotel-top_holder"></View>
        {/* skeleton screen: show placeholders while initial load */}
        {loadingHotels &&
          hotels.length === 0 &&
          Array.from({ length: 5 }).map((_, idx) => (
            <View
              key={`skeleton-${idx}`}
              className="hotel-card hotel-card--skeleton"
            >
              <View className="hotel-card__media">
                <View className="hotel-card__image skeleton-rect" />
                <View className="hotel-card__rating skeleton-rect" />
              </View>
              <View className="hotel-card__body">
                <View className="hotel-card__title">
                  <View className="hotel-card__title-text skeleton-rect" />
                </View>
                <View className="hotel-card__row">
                  <View className="hotel-card__distance">
                    <View className="skeleton-rect short" />
                  </View>
                  <View className="hotel-card__price">
                    <View className="skeleton-rect short" />
                  </View>
                </View>
                <View className="hotel-card__row">
                  <View className="hotel-card__tags">
                    <View className="skeleton-rect tag" />
                    <View className="skeleton-rect tag" />
                    <View className="skeleton-rect tag" />
                  </View>
                  <View className="hotel-card__extra">
                    <View className="skeleton-rect short" />
                  </View>
                </View>
              </View>
            </View>
          ))}
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
                    lazyLoad
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
                      ) : (
                        <p>??</p>
                      )}
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
              ? `已显示${hotels.length}条，上拉加载更多`
              : `已显示${hotels.length}条`}
        </View>
      )}
    </ScrollView>
  );
}

export default HotelList;
