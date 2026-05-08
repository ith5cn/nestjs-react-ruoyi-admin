import request from "@/utils/request";

/**
 * 数据列表
 */
export const getPageList = (params = {}) => {
    return request.get('/tcl/account/index', { params });
}

/**
 * 申请账号
 */
export const accountApply = (data = {}) => {
    return request.post('/tcl/account/apply', data)
}

/**
 * 申请账号记录
 */
export const applyAccountHistory = (params = {}) => {
    return request.get('/tcl/account/apply-history', { params })
}