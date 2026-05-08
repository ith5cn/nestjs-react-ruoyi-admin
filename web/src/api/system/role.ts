import request from "@/utils/request";

/**
 * 角色列表
 */
export const roleListApi = (params?: any) => {
    return request.get("/system/role/index", { params })
}

/**
 * 新增角色
 */
export const roleCreateApi = (data: any) => {
    return request.post("/system/role/create", data)
}

/**
 * 更新角色
 */
export const roleUpdateApi = (id: string | number, data: any) => {
    return request.put(`/system/role/${id}`, data)
}

/**
 * 删除角色
 */
export const roleDeleteApi = (id: string | number) => {
    return request.delete(`/system/role/${id}`)
}

/**
 * 角色绑定菜单
 */
export const roleBindMenuApi = (id: string | number, data: { ids: number[] }) => {
    return request.post(`/system/role/${id}/menu`, data)
}

/**
 * 允许访问的角色
 */
export const roleAccessApi = () => {
    return request.get("/system/role/access")
}