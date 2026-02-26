import type { IUser } from "@/types/auth";
import { useAppSelector } from "./hooks";

export function useToken() {
  const token = useAppSelector((state) => state.auth.accessToken);
  return token;
}


export function useUser() {
  const user = useAppSelector((state) => state.auth.userobj);
  return user as IUser;
}