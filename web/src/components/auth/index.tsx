import React, { type ReactNode } from 'react';
import usePermissionStore from '@/store/usePermissionStore';
import useUserStore from '@/store/useUserStore';

interface AuthProps {
    /** 权限代码，可以是字符串或字符串数组 */
    code?: string | string[];
    /** 如果拥有权限时渲染的子组件 */
    children: ReactNode;
}

/**
 * 权限校验控制组件
 * 
 * 只有具备对应的权限，子组件才会被渲染，否则返回 null (即不显示)
 */
const Auth: React.FC<AuthProps> = ({ code, children }) => {
    // 从持久化 store 取出用户的全局权限字典和角色
    const permissions = usePermissionStore(state => state.permissionCodes) || [];
    const roles = useUserStore(state => state.roles) || [];

    const hasAuth = (authCodes?: string | string[]) => {
        // 如果没有传入 code 属性，默认全放行
        if (!authCodes) return true;
        
        const codesArray = Array.isArray(authCodes) ? authCodes : [authCodes];
        
        if (codesArray.length === 0) return true;
        
        // 超级管理员特权 (role 1) 或如果有 '*' 或者 'all' 代表无限权限
        if (roles.some(r => String(r) === '1') || permissions.includes('*:*:*') || permissions.includes('*')) return true;

        // 按需比对权限，只要满足其中一个就能显示
        return codesArray.some((c) => permissions.includes(c));
    };

    // 如果拥有权限，渲染内容；没有则隐藏
    if (hasAuth(code)) {
        return <>{children}</>;
    }

    return null;
};

export default Auth;
