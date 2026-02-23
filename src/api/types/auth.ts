import type { AuthRole } from "@/types/auth"
import type { AxiosRequestConfig } from "axios";

export type APIAuthRole = Exclude<AuthRole, "USER">

export type RequestMeta = {
    withAuth?:boolean;
};

export type AppAxiosRequestConfig<T=any> = AxiosRequestConfig<T> & {
    meta?:RequestMeta;
}

export interface IAuthRegisterRequest {
    username: string
    password: string
    role: APIAuthRole
};

export interface IAuthLoginRequest {
    username: string
    password: string
}

export interface IUserMeResponse {
    userId: number
    username: string
    role: APIAuthRole
}

export interface ITokenResponse {
    access_token: string
}