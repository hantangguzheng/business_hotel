export type AuthRole = "USER" | "MERCHANT" | "ADMIN";

export interface IUser {
    userId: number
    username: string
    role: AuthRole
}

