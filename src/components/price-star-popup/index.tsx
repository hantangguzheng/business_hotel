import { useEffect, useMemo, useState } from "react";
import { View } from "@tarojs/components";
import { Button, Popup, Range } from "@nutui/nutui-react-taro";
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

const PRICE_MIN = 0;
const PRICE_MAX = 550;
const PRICE_MAX_EXTENDED = 580;
const PRICE_STEP = 10;

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
  const optionToRange = (option: PriceOption): [number, number] => {
    const minValue =
      typeof option.min === "number"
        ? Math.max(PRICE_MIN, Math.min(PRICE_MAX, option.min))
        : PRICE_MIN;
    const maxValue =
      typeof option.max === "number"
        ? Math.max(PRICE_MIN, Math.min(PRICE_MAX_EXTENDED, option.max))
        : PRICE_MAX_EXTENDED;

    return minValue > maxValue ? [maxValue, maxValue] : [minValue, maxValue];
  };

  const normalizePriceRange = (
    minValue?: number,
    maxValue?: number,
  ): [number, number] => {
    const safeMin =
      typeof minValue === "number"
        ? Math.max(PRICE_MIN, Math.min(PRICE_MAX_EXTENDED, minValue))
        : PRICE_MIN;
    const safeMax =
      typeof maxValue === "number"
        ? Math.max(PRICE_MIN, Math.min(PRICE_MAX_EXTENDED, maxValue))
        : PRICE_MAX_EXTENDED;

    if (safeMin > safeMax) return [safeMax, safeMax];
    return [safeMin, safeMax];
  };

  const [priceRange, setPriceRange] = useState<[number, number]>(
    normalizePriceRange(initialValue?.minPrice, initialValue?.maxPrice),
  );
  const [selectedMinStar, setSelectedMinStar] = useState<number | undefined>(
    initialValue?.minStar,
  );

  useEffect(() => {
    if (!visible) return;
    setPriceRange(
      normalizePriceRange(initialValue?.minPrice, initialValue?.maxPrice),
    );
    setSelectedMinStar(initialValue?.minStar);
  }, [
    initialValue?.maxPrice,
    initialValue?.minPrice,
    initialValue?.minStar,
    visible,
  ]);

  const minPriceLabel = useMemo(() => {
    return `¥${priceRange[0]}`;
  }, [priceRange]);

  const maxPriceLabel = useMemo(() => {
    if (priceRange[1] > PRICE_MAX) {
      return `¥${PRICE_MAX}以上`;
    }
    return `¥${priceRange[1]}`;
  }, [priceRange]);

  const selectedPriceOptionLabel = useMemo(() => {
    const matchedOption = PRICE_OPTIONS.find((option) => {
      const [optionMin, optionMax] = optionToRange(option);
      return optionMin === priceRange[0] && optionMax === priceRange[1];
    });
    return matchedOption?.label;
  }, [priceRange]);

  const handlePriceRangeChange = (value: number | number[]) => {
    if (!Array.isArray(value) || value.length < 2) return;
    const nextMin = Number(value[0]);
    const nextMax = Number(value[1]);
    setPriceRange(normalizePriceRange(nextMin, nextMax));
  };

  const handleSelectPriceOption = (option: PriceOption) => {
    const [optionMin, optionMax] = optionToRange(option);
    const isActive = optionMin === priceRange[0] && optionMax === priceRange[1];
    if (isActive) {
      setPriceRange([PRICE_MIN, PRICE_MAX_EXTENDED]);
      return;
    }
    setPriceRange([optionMin, optionMax]);
  };

  const handleClear = () => {
    setPriceRange([PRICE_MIN, PRICE_MAX_EXTENDED]);
    setSelectedMinStar(undefined);
  };

  const handleConfirm = () => {
    const [rangeMin, rangeMax] = priceRange;
    onConfirm({
      minPrice: rangeMin > PRICE_MIN ? rangeMin : undefined,
      maxPrice: rangeMax <= PRICE_MAX ? rangeMax : undefined,
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

          <View className="price-star-popup__sliderhint">
            <View className="price-star-popup__slider">
              <Range
                range
                min={PRICE_MIN}
                max={PRICE_MAX_EXTENDED}
                step={PRICE_STEP}
                value={priceRange}
                currentDescription={null}
                minDescription={null}
                maxDescription={null}
                onChange={handlePriceRangeChange}
              />
            </View>
          </View>

          <View className="price-star-popup__chips">
            {PRICE_OPTIONS.map((option) => {
              const active = selectedPriceOptionLabel === option.label;
              return (
                <View
                  key={option.label}
                  className={
                    active
                      ? "price-star-popup__chip is-active"
                      : "price-star-popup__chip"
                  }
                  onClick={() => handleSelectPriceOption(option)}
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
