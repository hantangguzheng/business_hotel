import { useAppSelector } from "@/hooks/hooks";
import authSlice from "@/store/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import { Avatar, Dropdown, Layout, Space } from "antd";
import type { AuthRole } from "@/types/auth";

import styles from "./LayoutHeader.module.css";



export function LayoutHeader({ headerBg }: { headerBg?: string }) {
    const { userobj } = useAppSelector(s => s.auth);
    const { Header } = Layout;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onLogout = () => {
        dispatch(authSlice.actions.logout());
        navigate('/auth/login');
    };
    const onLogoClick = () => {
        navigate('/');
    }

    const titleMap: Partial<Record<AuthRole, string>> = {
        'ADMIN': '管理员',
        'MERCHANT': '商家',
    }
    const titleRoleLabel = (userobj?.role ? titleMap[userobj.role] : undefined) ?? '游客';

    return (
        <Header
            className={styles.header}
            style={{ background: headerBg }}>
            <Space className={styles["logo-container"]}>
                {/* <img src="/favicon.png" alt="Logo" className={styles.logo}/> */}
                <Avatar onClick={onLogoClick} size={70} src={<img src="/favicon.png" alt="Logo" />} className={styles.logo} ></Avatar>
                <span className={styles.title}>易宿酒店管理系统-{titleRoleLabel}端</span>
            </Space>
            <Space className={styles.user}>
                欢迎回来,
                <Dropdown menu={{
                    items: [
                        { key: 'logout', label: '退出登录', onClick: onLogout }
                    ]
                }}>
                    <span  className={styles.username}>

                    {userobj?.username}
                    </span>
                </Dropdown>
            </Space>
        </Header>
    );
}