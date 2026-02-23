import { useAppSelector } from '@/hooks/hooks';
import { AuthLayout } from '@/layout/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { createBrowserRouter, Navigate } from 'react-router';

const RootRedirectionRouter = ()=>{
    const {isAuthorized, isLoading, userobj} = useAppSelector((state)=>state.auth);
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
    return null;
}

export const AppRouter = createBrowserRouter([
    {
        path:'/',
        element:<RootRedirectionRouter/>,
    },
    {
        path:'/auth',
        element: <AuthLayout/>,
        children:[
            { index: true, element: <Navigate to="/auth/login" replace /> },
            {
                path:'login',
                element: <LoginPage />
            },
            {
                path:'register',
                element:<RegisterPage />
            }
        ]
    }
    // todo: merchant and admin
])
