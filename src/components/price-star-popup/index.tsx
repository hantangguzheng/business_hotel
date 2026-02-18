import { useEffect, useMemo, useState } from "react";
import { View } from "@tarojs/components";
import { Button, Popup } from "@nutui/nutui-react-taro";
import { Close } from "@nutui/icons-react-taro";
import "./index.scss";

type PriceStarValue = {
  minPrice?: number;
  maxPrice?: number;
  minStar?: number;
};

type PriceOption = {
  label: string;
  min?: number;
  max?: number;
};

type PriceStarPopupProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: PriceStarValue) => void;
  initialValue?: PriceStarValue;
  title?: string;
};

const PRICE_OPTIONS: PriceOption[] = [
  { label: "¥150以下", min: 0, max: 150 },
  { label: "¥150-¥200", min: 150, max: 200 },
  { label: "¥200-¥250", min: 200, max: 250 },
  { label: "¥250-¥300", min: 250, max: 300 },
  { label: "¥300-¥400", min: 300, max: 400 },
  { label: "¥400-¥500", min: 400, max: 500 },
  { label: "¥500-¥550", min: 500, max: 550 },
  { label: "¥550以上", min: 550 },
];

const STAR_OPTIONS = [2, 3, 4, 5];

function PriceStarPopup({
  visible,
  onClose,
  onConfirm,
  initialValue,
  title = "选择价格/星级",
}: PriceStarPopupProps) {
  const [selectedMinPrice, setSelectedMinPrice] = useState<number | undefined>(
    initialValue?.minPrice,
  );
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number | undefined>(
    initialValue?.maxPrice,
  );
  const [selectedMinStar, setSelectedMinStar] = useState<number | undefined>(
    initialValue?.minStar,
  );

  useEffect(() => {
    if (!visible) return;
    setSelectedMinPrice(initialValue?.minPrice);
    setSelectedMaxPrice(initialValue?.maxPrice);
    setSelectedMinStar(initialValue?.minStar);
  }, [
    initialValue?.maxPrice,
    initialValue?.minPrice,
    initialValue?.minStar,
    visible,
  ]);

  const minPriceLabel = useMemo(() => {
    if (typeof selectedMinPrice !== "number") return "¥0";
    return `¥${selectedMinPrice}`;
  }, [selectedMinPrice]);

  const maxPriceLabel = useMemo(() => {
    if (typeof selectedMaxPrice === "number") return `¥${selectedMaxPrice}`;
    if (typeof selectedMinPrice === "number") return `¥${selectedMinPrice}以上`;
    return "¥550以上";
  }, [selectedMaxPrice, selectedMinPrice]);

  const handleSelectPrice = (option: PriceOption) => {
    const isActive =
      selectedMinPrice === option.min && selectedMaxPrice === option.max;
    if (isActive) {
      setSelectedMinPrice(undefined);
      setSelectedMaxPrice(undefined);
      return;
    }
    setSelectedMinPrice(option.min);
    setSelectedMaxPrice(option.max);
  };

  const handleClear = () => {
    setSelectedMinPrice(undefined);
    setSelectedMaxPrice(undefined);
    setSelectedMinStar(undefined);
  };

  const handleConfirm = () => {
    onConfirm({
      minPrice: selectedMinPrice,
      maxPrice: selectedMaxPrice,
      minStar: selectedMinStar,
    });
    onClose();
  };

  return (
    <Popup visible={visible} position="bottom" onClose={onClose}>
      <View className="price-star-popup">
        <View className="price-star-popup__header">
          <View className="price-star-popup__close" onClick={onClose}>
            <Close color="#1b2a4e" width="16px" />
          </View>
          <View className="price-star-popup__title">{title}</View>
        </View>

        <View className="price-star-popup__section">
          <View className="price-star-popup__section-title">价格</View>
          <View className="price-star-popup__bar" />
          <View className="price-star-popup__range">
            <View className="price-star-popup__range-box">
              <View className="price-star-popup__range-label">最低</View>
              <View className="price-star-popup__range-value">
                {minPriceLabel}
              </View>
            </View>
            <View className="price-star-popup__range-dash">—</View>
            <View className="price-star-popup__range-box">
              <View className="price-star-popup__range-label">最高</View>
              <View className="price-star-popup__range-value">
                {maxPriceLabel}
              </View>
            </View>
          </View>

          <View className="price-star-popup__chips">
            {PRICE_OPTIONS.map((option) => {
              const active =
                selectedMinPrice === option.min &&
                selectedMaxPrice === option.max;
              return (
                <View
                  key={option.label}
                  className={
                    active
                      ? "price-star-popup__chip is-active"
                      : "price-star-popup__chip"
                  }
                  onClick={() => handleSelectPrice(option)}
                >
                  {option.label}
                </View>
              );
            })}
          </View>
        </View>

        <View className="price-star-popup__section">
          <View className="price-star-popup__section-row">
            <View className="price-star-popup__section-title">星级/钻级</View>
            <View className="price-star-popup__hint">国内星级/钻级说明</View>
          </View>

          <View className="price-star-popup__stars">
            {STAR_OPTIONS.map((star) => {
              const active = selectedMinStar === star;
              return (
                <View
                  key={star}
                  className={
                    active
                      ? "price-star-popup__star is-active"
                      : "price-star-popup__star"
                  }
                  onClick={() =>
                    setSelectedMinStar((current) =>
                      current === star ? undefined : star,
                    )
                  }
                >
                  {star}钻/星
                </View>
              );
            })}
          </View>
        </View>

        <View className="price-star-popup__actions">
          <Button className="price-star-popup__btn" onClick={handleClear}>
            清空
          </Button>
          <Button
            className="price-star-popup__btn price-star-popup__btn--primary"
            type="primary"
            onClick={handleConfirm}
          >
            完成
          </Button>
        </View>
      </View>
    </Popup>
  );
}

export type { PriceStarValue };
export default PriceStarPopup;
