import request from "@/utils/request";

interface DeptSearch {
    tree?: boolean
}

/**
 * 可访问的accessDept
 */
export const accessDeptApi = (params: DeptSearch) => {
    return request.get('/system/dept/access', { params });
}

/**
 * 部门列表
 */
export const deptListApi = (params?: any) => {
    return request.get('/system/dept/index', { params });
}

/**
 * 创建部门
 */
export const deptCreateApi = (data: any) => {
    return request.post('/system/dept', data);
}

/**
 * 更新部门
 */
export const deptUpdateApi = (id: number | string, data: any) => {
    return request.put(`/system/dept/${id}`, data);
}

/**
 * 删除部门
 */
export const deptDeleteApi = (id: number | string) => {
    return request.delete(`/system/dept/${id}`);
}