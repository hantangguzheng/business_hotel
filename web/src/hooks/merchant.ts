import { useDispatch } from "react-redux";
import { useAppSelector } from "./hooks";
import { endpoint } from "@/api/endpoint";
import useAxios from "axios-hooks";
import { useEffect } from "react";
import hotelSlice from "@/store/hotelSlice";
import type { IHotelListResponseSingle } from "@/api/types/hotel";
import { STATIC_ROOT } from "@/utils/config";

export const useHotels = (enable=true) => {
    const dispatch = useDispatch();
    const list = useAppSelector(s => s.hotels.list);

    const [{ data, loading, error }, refetch] = useAxios<IHotelListResponseSingle[]>(
        { ...endpoint.getListHotels() }, { manual: true }
    );

    useEffect(() => {
        if (enable && list === null) {
            refetch();
        }
    }, [list, enable]);

    useEffect(() => {
        if (data) {
            dispatch(hotelSlice.actions.setList(data.map(v => ({
                ...v,
                imageUrls: v.imageUrls?.map(url => {
                    if (url.trim().startsWith('/')) {
                        return `${STATIC_ROOT}${url}`;
                    }
                    return url;
                }),
            }))));
        }
    }, [data]);

    const getHotel = (id: number) => list?.find(h => h.id === id);
    const refresh = () => dispatch(hotelSlice.actions.clearList());

    return { list, loading, error, getHotel, refresh };
}