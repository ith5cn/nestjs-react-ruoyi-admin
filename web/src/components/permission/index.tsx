import React from 'react';
import usePermissionStore from '@/store/usePermissionStore';

interface Props {
    code: string;
    children: React.ReactNode;
}

export const HasPermission: React.FC<Props> = ({ code, children }) => {
    const { permissionCodes } = usePermissionStore();

    const hasAccess = permissionCodes.includes(code) || permissionCodes.includes('*:*:*');

    return hasAccess ? <>{children}</> : null;
};