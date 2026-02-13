import React, { createContext, useContext, useMemo, useState } from "react";

export type SharedFilterState = {
  city: string;
  keyword: string;
  checkIn: string;
  checkOut: string;
  roomCount: number;
  adultCount: number;
  childCount: number;
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
  keyword: "",
  checkIn: defaultDates.checkIn,
  checkOut: defaultDates.checkOut,
  roomCount: 1,
  adultCount: 1,
  childCount: 0,
};

const SharedFilterContext = createContext<SharedFilterContextValue | null>(
  null,
);

export function SharedFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filter, setFilterState] =
    useState<SharedFilterState>(defaultFilterState);

  const setFilter = (next: Partial<SharedFilterState>) => {
    setFilterState((current) => ({ ...current, ...next }));
  };

  const resetFilter = () => {
    setFilterState(defaultFilterState);
  };

  const value = useMemo(() => ({ filter, setFilter, resetFilter }), [filter]);

  return (
    <SharedFilterContext.Provider value={value}>
      {children}
    </SharedFilterContext.Provider>
  );
}

export function useSharedFilter() {
  const context = useContext(SharedFilterContext);
  if (!context) {
    throw new Error("useSharedFilter must be used within SharedFilterProvider");
  }
  return context;
}
