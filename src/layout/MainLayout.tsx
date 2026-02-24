import { LayoutHeader } from "@/components/LayoutHeader";
import { LayoutSider } from "@/components/LayoutSider";
import { Layout } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import { Outlet } from "react-router";

const { Content } = Layout;

interface MainLayoutProps {
    menuItems?: ItemType<MenuItemType>[];
}

export function MainLayout({ menuItems }: MainLayoutProps) {
    return (
        <Layout style={{minHeight:'100vh'}}>
            <LayoutHeader />
            <Layout style={{overflow:'hidden', marginTop:64}}>
                <LayoutSider menuItems={menuItems} />
                <Content style={{overflow:'auto', height: '100%' ,marginLeft:200}}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}