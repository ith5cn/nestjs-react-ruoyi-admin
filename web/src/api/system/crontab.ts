import request from "@/utils/request";

/**
 * 任务列表
 */
export const crontabListApi = (params?: any) => {
    return request.get('/system/crontab/index', { params });
}

/**
 * 创建任务
 */
export const crontabCreateApi = (data: any) => {
    return request.post('/system/crontab', data);
}

/**
 * 更新任务
 */
export const crontabUpdateApi = (id: number | string, data: any) => {
    return request.put(`/system/crontab/${id}`, data);
}

/**
 * 删除任务
 */
export const crontabDeleteApi = (id: number | string) => {
    return request.delete(`/system/crontab/${id}`);
}

/**
 * 运行一次任务
 */
export const crontabRunApi = (id: number | string) => {
    return request.post(`/system/crontab/run/${id}`);
}


/**
 * 任务日志列表
 */
export const crontabLogListApi = (params?: any) => {
    return request.get('/system/crontab/log/index', { params });
}