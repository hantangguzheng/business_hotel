import axios from "axios";
import { tokenCookieManager } from "./authUtil";
import { useAppDispatch } from "@/hooks/hooks";
import authSlice from "@/store/authSlice";


const dispatch = useAppDispatch();

export const http = axios.create({});

// logout at 401 error
http.interceptors.response.use(
    (resp)=>resp,
    (err)=>{
        if (err?.response?.status == 401) {
            console.error("Token expired, please login again.")
            tokenCookieManager.clearToken();
            dispatch(authSlice.actions.logout());
        }
    }
)