import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * 请求上下文，存储当前请求的用户信息和请求元数据
 * 基于 AsyncLocalStorage，每个请求拥有独立的上下文，高并发下不会串数据
 */
export interface RequestContextData {
    /** 用户信息 */
    user?: {
        id: number;
        type: number;
        username?: string;
        nickname?: string;
        phone?: string;
        email?: string;
        deptId?: number;
        status?: number;
        codes?: string[];
        [key: string]: any;
    };
    /** 请求元数据 */
    requestInfo?: {
        ip: string;
        userAgent: string;
        headers: Record<string, any>;
    };
}

/**
 * 模块级 AsyncLocalStorage 实例
 * 供 RequestContextService（DI 方式）和 request()（函数方式）共享
 */
export const requestContextStorage = new AsyncLocalStorage<RequestContextData>();

@Injectable()
export class RequestContextService {
    private readonly als = requestContextStorage;

    /**
     * 在回调函数内运行，创建一个新的上下文
     */
    run(data: RequestContextData, callback: () => any) {
        return this.als.run(data, callback);
    }

    /**
     * 获取当前上下文
     */
    getContext(): RequestContextData | undefined {
        return this.als.getStore();
    }

    /**
     * 获取当前请求的用户信息
     */
    getUser(): RequestContextData['user'] | undefined {
        return this.als.getStore()?.user;
    }

    /**
     * 设置当前请求的用户信息
     */
    setUser(user: RequestContextData['user']) {
        const store = this.als.getStore();
        if (store) {
            store.user = user;
        }
    }

    /**
     * 获取当前用户的权限 codes
     */
    getCodes(): string[] {
        return this.als.getStore()?.user?.codes || [];
    }

    /**
     * 获取当前请求的元数据（IP、浏览器等）
     */
    getRequestInfo(): RequestContextData['requestInfo'] | undefined {
        return this.als.getStore()?.requestInfo;
    }
}
