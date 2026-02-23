import { Outlet, useLocation } from "react-router"
import styles from './AuthLayout.module.css'

const bgMap: Record<string, string> = {
  '/auth/login': '0%',
  '/auth/register': '100%',
};

export const AuthLayout = () => {
    const loc = useLocation();
    const curBgPos = bgMap[loc.pathname] ?? '0%';

    return <>
    <div className={styles.background} style={{backgroundPositionX:curBgPos}}></div>
    <div className={styles.container}>
        <Outlet />
    </div></>
}