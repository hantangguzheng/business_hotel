import type { APIAuthRole, AppAxiosRequestConfig, IAuthLoginRequest, IAuthRegisterRequest } from "./types/auth";

const API_ROOT = '';

const API_MERCHANT_HOTEL = 'api/merchant/hotels';

const withAuthorization = (config: AppAxiosRequestConfig) : AppAxiosRequestConfig => {
  return {
    ...config,
    meta:{
      ...config.meta,
      withAuth:true,
    },
  };
};

export const endpoint = {
  // auth
  postLogin: (username:string, password:string):
    AppAxiosRequestConfig<IAuthLoginRequest> => {
      return {
        url:`${API_ROOT}/auth/login`,
        method:'POST',
        data:{
          username,
          password,
        },
      };
  },
  postRegister: (username:string, password:string, role:APIAuthRole):
    AppAxiosRequestConfig<IAuthRegisterRequest> => {
      return {
        url:`${API_ROOT}/auth/register`,
        method:'POST',
        data:{
          username,
          password,
          role,
        }
      };
  },
  getUserMe: ():AppAxiosRequestConfig<any> => {
    return withAuthorization({
      url:`${API_ROOT}/users/me`,
      method:'GET',
    });
  },
  // merchant
  getListHotels: ():AppAxiosRequestConfig<any>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_MERCHANT_HOTEL}/`,
      method:'GET',
    });
    
  }

}