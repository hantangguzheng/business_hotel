import { useAppSelector } from '@/hooks/hooks';
import { AuthLayout } from '@/layout/AuthLayout';
import { MerchantLayout } from '@/layout/MerchantLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { HotelCreatePage } from '@/pages/merchant/HotelCreatePage';
import { HotelDetailPage } from '@/pages/merchant/HotelDetailPage';
import { HotelEditPage } from '@/pages/merchant/HotelEditPage';
import { HotelsPage } from '@/pages/merchant/HotelsPage';
import { PromotionsPage } from '@/pages/merchant/PromotionPage';
import { RoomCreatePage } from '@/pages/merchant/RoomCreatePage';
import { RoomDetailPage } from '@/pages/merchant/RoomDetailPage';
import { RoomEditPage } from '@/pages/merchant/RoomEditPage';
import { RoomsPage } from '@/pages/merchant/RoomsPage';
import type { AuthRole } from '@/types/auth';
import { App } from 'antd';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';

const RootRedirectionRouter = () => {
    const { isAuthorized, isLoading, userobj } = useAppSelector((state) => state.auth);
    if (isLoading) {
        return <div>loading@@</div>;
    }
    if (!isAuthorized) {
        return <Navigate to='/auth/login' replace />;
    }
    if (userobj?.role === 'ADMIN') {
        return <Navigate to='/admin' replace />;
    }
    if (userobj?.role === 'MERCHANT') {
        return <Navigate to='/merchant' replace />;
    }
    return <div>loading@</div>;
}

interface RoleGaurdProps {
    allowedRoles: AuthRole[];
}
const RoleGaurd = ({ allowedRoles }: RoleGaurdProps) => {
    const { isAuthorized, userobj, isLoading } = useAppSelector(s => s.auth);
    const { message: msg } = App.useApp();
    const msgLoadingKey = 'router-loading';

    if (isLoading) {
        msg.open({
            content: '加载用户信息中...',
            type: 'loading',
            key: msgLoadingKey,
            duration: 0,
        });
        return <div>loading@@</div>;
    }
    if (!isAuthorized) {
        return <Navigate to="/auth/login" replace />;
    }
    if (!(userobj?.role) || !(allowedRoles.includes(userobj.role))) {
        // msg.open({
        //     content: '用户权限不匹配',
        //     type: 'error',
        //     key: msgLoadingKey,
        //     duration: 2,
        // });
        // return <Navigate to="/" replace />;
        return <div>uuu</div>;
    }
    msg.destroy(msgLoadingKey);

    return <Outlet />;
}

export const AppRouter = createBrowserRouter([
    {
        path: '/',
        element: <RootRedirectionRouter />,
    },
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            { index: true, element: <Navigate to="/auth/login" replace /> },
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path: 'register',
                element: <RegisterPage />
            }
        ]
    },
    {
        element: <RoleGaurd allowedRoles={['MERCHANT']} />,
        children: [{
            path: '/merchant',
            element: <MerchantLayout />,
            children: [
                {index:true, element: <Navigate to="/merchant/hotels" replace />},
                {
                    path: 'hotels',
                    element: <HotelsPage/>,
                },
                {
                    path: 'hotel/create',
                    element: <HotelCreatePage/>,
                },
                {
                    path: 'hotel/:id',
                    element: <HotelDetailPage/>,
                },
                {
                    path: 'hotel/:id/edit',
                    element: <HotelEditPage/>,
                },
                {
                    path: 'hotel/:id/rooms',
                    element: <RoomsPage/>,
                },
                {
                    path: 'hotel/:id/room/create',
                    element: <RoomCreatePage/>,
                },
                {
                    path: 'hotel/:id/room/:rid',
                    element: <RoomDetailPage/>,
                },
                {
                    path: 'hotel/:id/room/:rid/edit',
                    element: <RoomEditPage/>,
                },
                {
                    path: 'hotel/:id/promotions',
                    element: <PromotionsPage/>,
                },
            ],
        },]
    }
    // todo: merchant and admin
])
