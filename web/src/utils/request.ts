import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { message as Message } from 'antd';
import useUserStore from '@/store/useUserStore';
import { CryptoUtil } from './crypto';

// 定义 RuoYi 统一返回格式的接口
export interface Result<T = any> {
    code: number;
    message: string;
    data: T;
    total?: number; // 针对分页接口
}

const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
});

// 请求拦截
instance.interceptors.request.use((config) => {
    const token = useUserStore.getState().token;
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // API 加密拦截：处理防重放时间戳与签名
    const method = config.method?.toLowerCase() || '';
    if (['post', 'put', 'delete'].includes(method) && config.data && !(config.data instanceof FormData)) {
        // 防止重复包裹 (判断格式是不是已经是 { data: "string" })
        if (typeof config.data !== 'object' || !config.data.data || typeof config.data.data !== 'string') {
            const timestamp = Date.now();
            const nonce = Math.random().toString(36).substring(2);

            // 组装业务防重放载荷
            const payload = { ...config.data, timestamp, nonce };

            // 生成强制签名防篡改
            const sign = CryptoUtil.sign(payload);
            const dataWithSign = { ...payload, sign };

            // 
            console.log(`${config.url} 加密前===》`, payload)
            // 加密成最终结构
            config.data = {
                data: CryptoUtil.encrypt(dataWithSign)
            };
        }
    }

    return config;
}, (error) => Promise.reject(error));

// 响应拦截
instance.interceptors.response.use(
    (response: AxiosResponse<any>) => {
        // 解密拦截 (如果返回了类似加密后的 { data: "AES..." } 且没有常规的 code)
        if (response.data && response.data.data && typeof response.data.data === 'string' && response.data.code === undefined) {
            const decryptedData = CryptoUtil.decrypt(response.data.data);
            if (typeof decryptedData === 'object' && decryptedData !== null) {
                // 可选：前端可以拿到签名做反向校验
                // const { sign, ...dataWithoutSign } = decryptedData;
                // if (CryptoUtil.verify(dataWithoutSign, sign)) { ... }

                // 还原真实的 response.data (即 `{ code, message, data }` 的原貌)
                // 
                console.log("解密后===》", decryptedData)
                response.data = decryptedData;
            }
        }

        const { code, message } = response.data;
        if (code === 0 || code === 200) return response; // 这里返回完整 response，我们在下面方法里提取 data

        // 统一错误处理
        if (code === 401 || code === 402 || response.status === 401) {
            useUserStore.getState().logout();
            window.location.href = '/login';
        }

        Message.error(message || '服务异常');
        return Promise.reject(new Error(message || 'Error'));
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.data?.code === 401) {
            useUserStore.getState().logout();
            window.location.href = '/login';
        }
        Message.error(error.message || '网络异常');
        return Promise.reject(error);
    }
);

/**
 * 核心方法封装
 * T: 业务数据类型 (Result.data 的类型)
 * R: 最终返回给调用者的类型 (默认为 Result<T>)
 */
const request = {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
        return instance.get(url, config).then(res => res.data);
    },

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
        return instance.post(url, data, config).then(res => res.data);
    },

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
        return instance.put(url, data, config).then(res => res.data);
    },

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
        return instance.delete(url, config).then(res => res.data);
    },

    /** 上传文件（multipart/form-data） */
    uploadFile<T = any>(url: string, formData: FormData): Promise<Result<T>> {
        return instance.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(res => res.data);
    },

    /** 下载文件，返回 Blob */
    downloadFile(url: string): Promise<Blob> {
        return instance.get(url, { responseType: 'blob' }).then(res => res.data);
    },
};

export default request;