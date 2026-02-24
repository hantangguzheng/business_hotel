import { useDispatch } from "react-redux";
import { useAppSelector } from "./hooks";
import { endpoint } from "@/api/endpoint";
import useAxios from "axios-hooks";
import { useEffect } from "react";
import hotelSlice from "@/store/hotelSlice";
import type { IHotelListResponseSingle } from "@/api/types/hotel";

export const useHotels = () => {
    const dispatch = useDispatch();
    const list = useAppSelector(s => s.hotels.list);

    const [{ data, loading, error }, refetch] = useAxios<IHotelListResponseSingle[]>(
        { ...endpoint.getListHotels() }, { manual: true }
    );

    useEffect(() => {
        if (list === null) {
            refetch();
        }
    }, [list]);

    useEffect(() => {
        if (data) {
            dispatch(hotelSlice.actions.setList(data));
        }
    }, [data]);

    const getHotel = (id: number) => list?.find(h => h.id === id);
    const refresh = () => dispatch(hotelSlice.actions.clearList());

    return { list, loading, error, getHotel, refresh };
}