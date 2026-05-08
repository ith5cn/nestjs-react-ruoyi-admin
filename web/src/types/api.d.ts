declare namespace API {
    /** 全局通用响应体 */
    export interface Response<T = any> {
        code: number;
        msg: string;
        data: T;
        total?: number;
    }

    /** 分页请求参数 */
    export interface PageParams {
        pageSize?: number;
        current?: number;
        [key: string]: any;
    }
}