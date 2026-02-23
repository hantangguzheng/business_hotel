import { View } from "@tarojs/components";
import "./index.scss";

type GuestSelectorProps = {
  roomCount: number;
  adultCount: number;
  childCount: number;
  onChangeRoom: (next: number) => void;
  onChangeAdult: (next: number) => void;
  onChangeChild: (next: number) => void;
};

function GuestStepper({
  label,
  subLabel,
  value,
  min,
  onChange,
}: {
  label: string;
  subLabel?: string;
  value: number;
  min: number;
  onChange: (next: number) => void;
}) {
  const canMinus = value > min;

  return (
    <View className="shared-guest__item">
      <View className="shared-guest__label-wrap">
        <View className="shared-guest__label">{label}</View>
        {subLabel ? (
          <View className="shared-guest__sub-label">{subLabel}</View>
        ) : null}
      </View>
      <View className="shared-guest__controls">
        <View
          className={
            canMinus ? "shared-guest__btn" : "shared-guest__btn is-disabled"
          }
          onClick={() => {
            if (canMinus) {
              onChange(value - 1);
            }
          }}
        >
          -
        </View>
        <View className="shared-guest__value">{value}</View>
        <View className="shared-guest__btn" onClick={() => onChange(value + 1)}>
          +
        </View>
      </View>
    </View>
  );
}

function GuestSelector(props: GuestSelectorProps) {
  const {
    roomCount,
    adultCount,
    childCount,
    onChangeRoom,
    onChangeAdult,
    onChangeChild,
  } = props;

  return (
    <View className="shared-guest">
      <GuestStepper
        label="房间"
        value={roomCount}
        min={1}
        onChange={onChangeRoom}
      />
      <GuestStepper
        label="成人"
        value={adultCount}
        min={1}
        onChange={onChangeAdult}
      />
      <GuestStepper
        label="儿童"
        subLabel="0-17岁"
        value={childCount}
        min={0}
        onChange={onChangeChild}
      />
    </View>
  );
}

export default GuestSelector;
