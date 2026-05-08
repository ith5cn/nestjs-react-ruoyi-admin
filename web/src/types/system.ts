export interface SysMenu {
    id: number;
    parentId: number | null;
    name: string;
    code: string;        // 权限标识
    icon?: string;
    route: string;       // 路由地址
    component: string;   // 组件路径，如 'system/user/index'
    redirect?: string;
    isHidden: 1 | 2;     // 1是 2否
    isLayout: 1 | 2;     // 1是 2否
    type: 'M' | 'B' | 'L' | 'I'; // 菜单、按钮、链接、iframe
    status: 1 | 2;       // 1正常 2停用
    sort: number;
    children?: SysMenu[];
}