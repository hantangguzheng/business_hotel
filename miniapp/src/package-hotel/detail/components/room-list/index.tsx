import { Image, View } from "@tarojs/components";
import { Check } from "@nutui/icons-react-taro";
import type { HotelRoomItem } from "../../../../apis/type";

type BookingState = {
  roomId: number;
  unitPrice: number;
};

type RoomPriceDisplay = {
  currentPrice: number;
  originalPrice: number;
  promotionLabel: string;
};

type RoomListProps = {
  rooms: HotelRoomItem[];
  hotelImage: string;
  bookingState: BookingState | null;
  loading: boolean;
  roomLoading: boolean;
  getRoomCardTags: (room: HotelRoomItem) => string[];
  getRoomPriceDisplay: (room: HotelRoomItem) => RoomPriceDisplay;
  onBookRoom: (roomId: number, roomPrice: number) => void;
};

function RoomList({
  rooms,
  hotelImage,
  bookingState,
  loading,
  roomLoading,
  getRoomCardTags,
  getRoomPriceDisplay,
  onBookRoom,
}: RoomListProps) {
  return (
    <View className="detail-section">
      <View className="detail-rooms">
        {rooms.map((room) => {
          const priceDisplay = getRoomPriceDisplay(room);

          return (
            <View className="detail-room" key={room.id}>
              <Image
                className="detail-room__image"
                src={room.pictureUrl || hotelImage}
                mode="aspectFill"
                lazyLoad
              />
              <View className="detail-room__content">
                <View className="detail-room__name">{room.name}</View>
                <View className="detail-room__meta">
                  {getRoomCardTags(room).join(" · ") || "暂无房型信息"}
                </View>
                <View className="detail-room__bottom">
                  <View className="detail-room__stock">
                    剩余 {room.availableCount ?? 0} 间
                  </View>
                  <View className="detail-room__actions">
                    <View className="detail-room__price-wrap">
                      <View className="detail-room__price">
                        {priceDisplay.originalPrice > 0 ? (
                          <View className="detail-room__price-origin">
                            ¥{priceDisplay.originalPrice}
                          </View>
                        ) : null}
                        <View className="detail-room__price-main">
                          <View className="detail-room__price-main-sign">
                            ¥
                          </View>
                          <View className="detail-room__price-main-number">
                            {priceDisplay.currentPrice}
                          </View>
                        </View>
                      </View>
                      <View className="detail-room__extra">
                        {priceDisplay.promotionLabel ? (
                          <View className="detail-room__promotion-tag">
                            {priceDisplay.promotionLabel}
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View
                      className={`detail-room__book ${bookingState?.roomId === room.id ? "is-active" : ""}`}
                      onClick={() =>
                        onBookRoom(room.id, priceDisplay.currentPrice)
                      }
                    >
                      {bookingState?.roomId === room.id ? (
                        <Check width="12px" color="#ffffff" />
                      ) : (
                        "订"
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        {rooms.length === 0 ? (
          <View className="detail-empty">
            {loading || roomLoading ? "加载中..." : "暂无房型信息"}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default RoomList;
