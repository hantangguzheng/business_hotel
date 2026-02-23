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
            <Layout>
                <LayoutSider menuItems={menuItems} />
                <Content>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}