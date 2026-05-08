import Login from "@/pages/login";
import Register from "@/pages/register";
import AuthGuard from './AuthGuard';
import Layout from '@/layout';

// 公开路由 (不需 Token)
export const publicRoutes = [
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    }
];

// 需要经过 AuthGuard 保护，且带有 Layout 的基础包装
export const getProtectedLayoutRoute = () => {
    return {
        path: '/',
        element: (
            <AuthGuard>
                <Layout />
            </AuthGuard>
        ),
        children: [] as any[]
    };
};
