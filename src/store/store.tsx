import {configureStore} from '@reduxjs/toolkit'
import authSlice from './authSlice';
import hotelSlice from './hotelSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        hotels: hotelSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;