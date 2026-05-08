import request, { type Result } from "@/utils/request";


export interface registerData {
    username: string
    email: string
    password: string
    nickname?: string
    phone?: string
}

export interface loginData {
    username: string
    password: string
}

/**
 * 注册
 * @param data 
 * @returns 
 */
export const registerApi = (data: registerData) => {
    return request.post<Result>('/auth/system/register', data);
}

/**
 * 登录
 */
export const loginApi = (data: loginData) => {
    return request.post<Result>('/auth/system/login', data);
}
