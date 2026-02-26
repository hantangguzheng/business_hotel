import { MainLayout } from "@/layout/MainLayout"
import ConfigProvider from "antd/es/config-provider";

const merchantMenuItems = [
    { key: '/merchant/hotels', label: '酒店信息管理' },
    { key: '/merchant/hotel/create', label: '新增酒店申请' },
];

export const MerchantLayout = () => {

    return <ConfigProvider theme={{
        token: {
            colorPrimary: '#3059d1',
        }
    }}>
        <MainLayout menuItems={merchantMenuItems} />
    </ConfigProvider>
}