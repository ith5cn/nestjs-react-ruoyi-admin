import { type AppRouteRecord, loadPageElement } from '@/utils/routeUtils';
import useUserStore from '@/store/useUserStore';

// 工作台看板映射表：将后端返回的 dashboard 字段映射到对应的前端组件路径
const dashboardMapper: Record<string, string> = {
    'dashboard': 'system/home/index',
    'home': 'system/home/index',
    'statistics': 'statistics/index',
    'work': 'work/index',
    // 你可以在这里继续添加新的映射...
    // 'analyze': 'analyze/index',
};

const DynamicDashboard = () => {
    // 从 store 拿到当前用户的 userInfo
    const userInfo = useUserStore((state) => state.userInfo);

    // 1. 获取后端返回的标识，如果没有则默认为 ''
    const rawDashboard = userInfo?.dashboard || '';
    
    // 2. 根据映射表查找组件路径，如果找不到或者没传，则兜底给默认的 dashboard/index
    const dashboardComponent = dashboardMapper[rawDashboard] || rawDashboard || 'system/home/index';

    return loadPageElement(dashboardComponent);
};

/**
 * 静态路由表：不依赖后端动态菜单的固定页面路由
 * 后续需要添加新的静态页面（如 404、个人中心等），直接在此数组中追加即可
 */
export const staticRoutes: AppRouteRecord[] = [
    {
        path: '/dashboard',
        name: '工作台',
        isLayout: 1,
        meta: {
            title: '工作台',
            icon: 'HomeOutlined',
            affix: true,
            keepAlive: true,
        },
        element: <DynamicDashboard />
    },
];
