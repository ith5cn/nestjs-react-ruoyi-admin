import { create } from 'zustand';
import { transformMenuToRoutes } from '@/utils/routeUtils';
import request from '@/utils/request';
import type { SysMenu } from '@/types/system';
import useUserStore from './useUserStore';

interface PermissionState {
    menuTree: SysMenu[];
    permissionCodes: string[]; // 存储所有的 code (如 system:user:add)
    dynamicRoutes: any[];
    isLoaded: boolean;
    initPermissions: () => Promise<void>;
}

const usePermissionStore = create<PermissionState>((set) => ({
    menuTree: [],
    permissionCodes: [],
    dynamicRoutes: [],
    isLoaded: false,

    initPermissions: async () => {
        try {
            // 1. 从后端获取用户信息、菜单路由和权限 codes
            const res = await request.get<any>('/system/user');

            if (res.code === 0 || res.code === 200) {
                const { user, roles, routers, codes } = res.data;

                // 2. 更新用户信息到 UserStore
                useUserStore.getState().setUserInfo(user);
                useUserStore.getState().setRoles(roles);
                useUserStore.getState().setPermissions(codes);

                // 3. 生成 React 路由配置
                const routes = transformMenuToRoutes(routers);

                set({
                    menuTree: routers,
                    permissionCodes: codes,
                    dynamicRoutes: routes,
                    isLoaded: true
                });
            } else {
                set({ isLoaded: true });
            }
        } catch (error) {
            set({ isLoaded: true });
        }
    }
}));

export default usePermissionStore;