import { MainLayout } from "@/layout/MainLayout"
import ConfigProvider from "antd/es/config-provider";

const adminMenuItems = [
    { key: '/admin/hotels', label: '酒店信息审核' },
];
const adminColor = '#07605a'
export const AdminLayout = () => {

    return <ConfigProvider theme={{
        token: {
            colorPrimary: adminColor,
        }
    }}>
        <MainLayout bg={adminColor} menuItems={adminMenuItems} />
    </ConfigProvider>
}