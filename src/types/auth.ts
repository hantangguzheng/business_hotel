export type AuthRole = "USER" | "MERCHANT" | "ADMIN";

export interface IUser {
    userId: string
    username: string
    role: AuthRole
}

