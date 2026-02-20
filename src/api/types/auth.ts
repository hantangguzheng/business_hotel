export type AuthRole = "USER" | "MERCHANT" | "ADMIN";
export type APIAuthRole = Exclude<AuthRole, "USER">

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