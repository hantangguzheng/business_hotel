import Cookies from "js-cookie";

const accessTokenCookieKey = 'user_token';

export const tokenCookieManager = {
    getToken: ()=>Cookies.get(accessTokenCookieKey),
    setToken: (token:string)=>{
        Cookies.set(accessTokenCookieKey, token, {expires: 5});
    },
    clearToken: ()=>Cookies.remove(accessTokenCookieKey),
}