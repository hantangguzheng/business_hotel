import { Outlet, useLocation } from "react-router"
import styles from './AuthLayout.module.css'
import { Avatar, Space } from "antd";
import { motion } from 'framer-motion'

const bgMap: Record<string, string> = {
    '/auth/login': '0%',
    '/auth/register': '100%',
};

export const AuthLayout = () => {
    const loc = useLocation();
    const curBgPos = bgMap[loc.pathname] ?? '0%';

    return <>
        <div className={styles.background} style={{ backgroundPositionX: curBgPos }}></div>
        <div className={styles.container}>
            <Space vertical>
                <motion.div
                    layout
                    transition={{ duration: 0.2, ease: 'easeInOut' }}>
                <Space className={styles["logo-container"]}>
                    <Avatar size={70} src={<img src="/favicon.png" alt="Logo" />} className={styles.logo} ></Avatar>
                    <span className={styles.title}>易宿酒店管理系统</span>
                </Space>
                </motion.div>
                
                    <Outlet />
            </Space>
        </div></>
}