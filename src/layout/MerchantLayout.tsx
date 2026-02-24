import { MainLayout } from "@/layout/MainLayout"

const merchantMenuItems = [
    {key:'/merchant/hotels', label:'酒店信息管理'},
    {key:'/merchant/hotel/create', label:'新增酒店申请'},
];

export const MerchantLayout = ()=>{

    return <MainLayout menuItems={merchantMenuItems}/>
}