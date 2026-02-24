import { Layout, Menu } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import { useLocation, useNavigate } from "react-router";

interface LayoutSiderProps {
    menuItems?: ItemType<MenuItemType>[];
}

const { Sider } = Layout;

export const LayoutSider = ({ menuItems }: LayoutSiderProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <Sider style = {{position:'fixed', height:'100vh'}}>
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{marginTop:'15px'}}
                theme="dark"
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
}