import create from "zustand";
import React from "react";

export type SharedFilterState = {
  city: string;
  cityCode: string;
  keyword: string;
  checkIn: string;
  checkOut: string;
  roomCount: number;
  adultCount: number;
  childCount: number;
  userLat?: number;
  userLng?: number;
};

type SharedFilterContextValue = {
  filter: SharedFilterState;
  setFilter: (next: Partial<SharedFilterState>) => void;
  resetFilter: () => void;
};

const buildDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const toValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return { checkIn: toValue(today), checkOut: toValue(tomorrow) };
};

const defaultDates = buildDefaultDates();

const defaultFilterState: SharedFilterState = {
  city: "上海",
  cityCode: "2",
  keyword: "",
  checkIn: defaultDates.checkIn,
  checkOut: defaultDates.checkOut,
  roomCount: 1,
  adultCount: 1,
  childCount: 0,
  userLat: undefined,
  userLng: undefined,
};

type FilterStore = {
  filter: SharedFilterState;
  setFilter: (next: Partial<SharedFilterState>) => void;
  resetFilter: () => void;
};

const useFilterStore = create<FilterStore>((set) => ({
  filter: defaultFilterState,
  setFilter: (next) =>
    set((state) => ({ filter: { ...state.filter, ...(next || {}) } })),
  resetFilter: () => set({ filter: defaultFilterState }),
}));

export function SharedFilterProvider({ children }: { children: React.ReactNode }) {
  // keep provider in place for compatibility; zustand store is global
  return <>{children}</>;
}

export function useSharedFilter(): SharedFilterContextValue {
  const filter = useFilterStore((s) => s.filter);
  const setFilter = useFilterStore((s) => s.setFilter);
  const resetFilter = useFilterStore((s) => s.resetFilter);
  return { filter, setFilter, resetFilter };
}
