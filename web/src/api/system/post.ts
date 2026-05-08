import request from "@/utils/request";

/**
 * 岗位列表
 */
export const postListApi = (params?: any) => {
    return request.get('/system/post/index', { params });
}

/**
 * 新增岗位
 */
export const postCreateApi = (data: any) => {
    return request.post('/system/post', data);
}

/**
 * 更新岗位
 */
export const postUpdateApi = (id: string | number, data: any) => {
    return request.put(`/system/post/${id}`, data);
}

/**
 * 删除岗位
 */
export const postDeleteApi = (id: string | number) => {
    return request.delete(`/system/post/${id}`);
}

/**
 * 可访问的岗位
 */
export const accessPostApi = () => {
    return request.get('/system/post/access');
}