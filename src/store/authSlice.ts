import type { IUser } from "@/types/auth";
import { tokenCookieManager } from "@/utils/authUtil";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type IAuthorizationState = {
    isLoading: boolean,
    isAuthorized: boolean;
    accessToken: string;
    userobj: IUser | null;
};

const initAuthState: IAuthorizationState = {
    isLoading: true,
    isAuthorized: false,
    accessToken: '',
    userobj: null,
};


// Side effect: Cookie may change at login and logout
const authSlice = createSlice({
    name: 'auth',
    initialState: initAuthState,
    reducers: {
        login: (state:IAuthorizationState, action:PayloadAction<{
            accessToken:string
        }>) => {
            state.isAuthorized = true;
            state.accessToken = action.payload.accessToken;
            if (action.payload.accessToken) {
                tokenCookieManager.setToken(action.payload.accessToken);
            }
        },
        setUser: (state:IAuthorizationState, action:PayloadAction<IUser>) => {
            state.userobj = action.payload;
        },
        logout: (state:IAuthorizationState) => {
            state.isAuthorized = false;
            state.accessToken = '';
            state.userobj = null;
            tokenCookieManager.clearToken();
        },
        setLoading: (state:IAuthorizationState, action:PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export default authSlice;