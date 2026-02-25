import type { IHotelListResponseSingle } from "@/api/types/hotel";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import authSlice from "./authSlice";

export interface IHotelState {
    list: IHotelListResponseSingle[] | null;
    loading: boolean;
}

const initHotelState: IHotelState = {
    list: null,
    loading: false,
}

const hotelSlice = createSlice({
    name: 'hotels',
    initialState: initHotelState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setList(state, action: PayloadAction<IHotelListResponseSingle[]>) {
            state.list = action.payload;
            state.loading = false;
        },
        clearList(state) {
            state.list = null;
        },
        updateHotel(state, action: PayloadAction<IHotelListResponseSingle>) {
            if (state.list) {
                const index = state.list.findIndex(h => h.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(authSlice.actions.logout, (state) => {
            state.list = null;
        });
    }
});

export default hotelSlice;