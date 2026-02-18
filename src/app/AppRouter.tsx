import { MainLayout } from '@/layout/MainLayout';
import { createBrowserRouter } from 'react-router';



export const AppRouter = createBrowserRouter([
    {
        path:'/',
        element:<MainLayout/>,
        children:[
            
        ],
    },
])
