import { requestContextStorage, RequestContextData } from './request-context.service';

/**
 * 全局请求上下文辅助函数
 *
 * 无需依赖注入，在任何地方直接调用即可获取当前请求信息
 *
 * @example
 * ```ts
 * import { request } from '@/core/context/request.helper';
 *
 * const ip = request().getRealIp();
 * const user = request().getUser();
 * const userId = request().getUserId();
 * ```
 */
export function request() {
    const store = requestContextStorage.getStore();

    return {
        /**
         * 获取当前请求的真实 IP
         */
        getRealIp(): string {
            return store?.requestInfo?.ip || '127.0.0.1';
        },

        /**
         * 获取当前请求的 User-Agent
         */
        getUserAgent(): string {
            return store?.requestInfo?.userAgent || '';
        },

        /**
         * 获取当前请求的所有 Headers
         */
        getHeaders(): Record<string, any> {
            return store?.requestInfo?.headers || {};
        },

        /**
         * 获取当前登录用户信息
         */
        getUser(): RequestContextData['user'] | undefined {
            return store?.user;
        },

        /**
         * 获取当前登录用户 ID
         */
        getUserId(): number | undefined {
            return store?.user?.id;
        },
    };
}
