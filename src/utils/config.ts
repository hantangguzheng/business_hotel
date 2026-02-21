import axios from "axios";
import { tokenCookieManager } from "./authUtil";
import authSlice from "@/store/authSlice";
import { store } from "@/store/store";
import type { AppAxiosRequestConfig } from "@/api/types/auth";



export const http = axios.create({});

http.interceptors.request.use(
    (req) => {
        const accessToken = store.getState().auth.accessToken;
        if (!accessToken) {
            return req;
        }
        const useAuth = (req as AppAxiosRequestConfig)?.meta?.withAuth === true;
        if (!useAuth) {
            return req;
        }
        req.headers = req.headers ?? {};
        req.headers.Authorization = `Bearer ${accessToken}`;
        return req;
    }
)

// logout at 401 error
http.interceptors.response.use(
    (resp) => resp,
    (err) => {
        if (err?.response?.status == 401) {
            console.error("Token expired, please login again.")
            tokenCookieManager.clearToken();
            store.dispatch(authSlice.actions.logout());
        }
        return Promise.reject(err);
    }
)