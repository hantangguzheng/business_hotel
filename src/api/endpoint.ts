import { store } from "@/store/Store";
import type { AxiosRequestConfig } from "axios";
import type { APIAuthRole, IAuthLoginRequest, IAuthRegisterRequest } from "./types/auth";

const API_ROOT = ''

const withAuthorization = (config: AxiosRequestConfig) : AxiosRequestConfig => {
  const accessToken = store.getState().auth.accessToken;
  if (!accessToken) {
    return config;
  }
  return {...config,
    headers: {
      ...config.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  };
};

export const endpoint = {
  postLogin: (username:string, password:string):
    AxiosRequestConfig<IAuthLoginRequest> => {
      return {
        url:`${API_ROOT}/auth/login`,
        method:'POST',
        data:{
          username,
          password,
        }
      }
  },
  postRegister: (username:string, password:string, role:APIAuthRole):
    AxiosRequestConfig<IAuthRegisterRequest> => {
      return {
        url:`${API_ROOT}/auth/register`,
        method:'POST',
        data:{
          username,
          password,
          role,
        }
      }
  },
  getUserMe: ():AxiosRequestConfig<any> => {
    return withAuthorization({
      url:`${API_ROOT}/users/me`,
      method:'GET',
    })
  },
}