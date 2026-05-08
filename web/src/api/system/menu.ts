import request from "@/utils/request";

interface menuSearch {
    name?: string
    code?: string
    status?: number
}

export interface MenuFormData {
    id?: number
    parentId?: number | null
    name: string
    type: string
    icon?: string
    code: string
    route?: string
    component?: string
    sort: number
    isHidden: number
    isLayout: number
    status: number
    remark?: string
}

/**
 * 菜单列表
 */
export const menuListApi = (params: menuSearch) => {
    return request.get('/system/menu/index', { params });
}

/**
 * 新增菜单
 */
export const menuCreateApi = (data: MenuFormData) => {
    return request.post('/system/menu/create', data);
}

/**
 * 更新菜单
 */
export const menuUpdateApi = (id: number, data: MenuFormData) => {
    return request.put(`/system/menu/${id}`, data);
}

/**
 * 删除菜单
 */
export const menuDeleteApi = (id: number) => {
    return request.delete(`/system/menu/${id}`);
}

/**
 * 获取当前用户可访问的菜单树
 */
export const menuAccessApi = () => {
    return request.get('/system/menu/accessMenu');
}

/**
 * 获取角色已拥有的菜单ID列表
 */
export const menuByRoleApi = (roleId: number | string) => {
    return request.get(`/system/menu/getMenuByRole/${roleId}`);
}