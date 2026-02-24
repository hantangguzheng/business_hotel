import type { APIAuthRole, AppAxiosRequestConfig, IAuthLoginRequest, IAuthRegisterRequest } from "./types/auth";
import type { IHotelCreateRequest } from "./types/hotel";
import type { IRoomCreateRequest, IRoomListResponse } from "./types/room";

const API_ROOT = '';

const API_MERCHANT_HOTEL = 'api/merchant/hotels';
const API_HOTEL = 'hotels';
const API_ROOM = 'rooms';

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
  // hotel
  getListHotels: ():AppAxiosRequestConfig<any>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_MERCHANT_HOTEL}/`,
      method:'GET',
    });
    
  },
  postCreateHotel: (info:IHotelCreateRequest|FormData):AppAxiosRequestConfig<IHotelCreateRequest|FormData>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_MERCHANT_HOTEL}/`,
      method:'POST',
      data:info,
    });
  },
  putUpdateHotel: (id:number, info:IHotelCreateRequest|FormData):AppAxiosRequestConfig<IHotelCreateRequest|FormData>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_MERCHANT_HOTEL}/${id}`,
      method:'PUT',
      data:info,
    });
  },
  // room
  getListRooms: (hotelId:number):AppAxiosRequestConfig<any>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_HOTEL}/${hotelId}/rooms`,
      method:'GET',
    });
  },
  postCreateRoom: (hotelId:number, info:IRoomCreateRequest|FormData):AppAxiosRequestConfig<IRoomCreateRequest|FormData>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_HOTEL}/${hotelId}/rooms`,
      method:'POST',
      data:info,
    });
  },
  putUpdateRoom: (roomId:number, info:IRoomCreateRequest|FormData):AppAxiosRequestConfig<IRoomCreateRequest|FormData>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_ROOM}/${roomId}`,
      method:'PUT',
      data:info,
    });
  },
  deleteDeleteRoom: (roomId:number):AppAxiosRequestConfig<any>=>{
    return withAuthorization({
      url:`${API_ROOT}/${API_ROOM}/${roomId}`,
      method:'DELETE',
    });
  },
}