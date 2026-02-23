import { endpoint } from "@/api/endpoint";
import type { IUserMeResponse } from "@/api/types/auth";
import { useAppSelector } from "@/hooks/hooks";
import authSlice from "@/store/authSlice";
import { tokenCookieManager } from "@/utils/authUtil";
import useAxios from "axios-hooks";
import { useEffect } from "react";
import { useDispatch } from "react-redux";


// check and sync login status from cookie
export function AppAuth(){

    const auth = useAppSelector(state=>state.auth);
    const dispatch = useDispatch();

    const [resUser, execUser] = useAxios<IUserMeResponse>({...endpoint.getUserMe()}, {manual:true});

    const checkInitAuth = () => {
        const curToken = tokenCookieManager.getToken();
        if (!curToken?.trim()) {
            if (auth.isAuthorized) {
                dispatch(authSlice.actions.logout());
            }
            return;
        }
        if (auth.isAuthorized && auth.accessToken === curToken) {
            return;
        }
        dispatch(authSlice.actions.login({accessToken:curToken}));
    }

    // onMount
    useEffect(()=>{
        checkInitAuth();
        dispatch(authSlice.actions.setLoading(false));
    }, []);

    // pull user info while auth info changed
    useEffect(()=>{
        if (!auth.isAuthorized) {
            return;
        }
        execUser(endpoint.getUserMe());
    }, [auth.isAuthorized, auth.accessToken, execUser]);

    // read user result
    useEffect(()=>{
        if (resUser.loading) {
            return;
        }
        if (resUser.error) {
            console.error(`Error (code:${resUser.error.code}) occured while fetching user info.\nMsg:${resUser.error.message} `);
            return;
        }
        if (resUser.data) {
            dispatch(authSlice.actions.setUser(resUser.data))
        }
    }, [resUser.loading, resUser.error, resUser.data, resUser.response, dispatch]);

    return null;
}