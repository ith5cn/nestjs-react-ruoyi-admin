import request from "@/utils/request";

export const userListApi = (params: any) => {
    return request.get("/system/user/index", { params })
}

export const userUpdateApi = (id: string | number, data: any) => {
    return request.put(`/system/user/${id}`, data)
}

export const userAddApi = (data: any) => {
    return request.post("/system/user", data)
}

export const userDeleteApi = (id: string | number) => {
    return request.delete(`/system/user/${id}`)
}

export const userRefreshCacheApi = (id: string | number) => {
    return request.put(`/system/user/${id}/refresh-cache`)
}

export const userAuthListApi = () => {
    return request.get(`/system/user/auth-list`)
}

export const getCurrentUserApi = () => {
    return request.get(`/system/user`)
}