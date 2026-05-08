import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ClientHttpService {
    private readonly logger = new Logger(ClientHttpService.name);

    constructor(private readonly httpService: HttpService) { }

    /**
     * 封装统一的请求方法
     * @param config Axios 配置
     * @param label 用于日志记录的标签（如：调用高德地图API）
     */
    async request<T = any>(config: AxiosRequestConfig, label = '第三方接口'): Promise<T> {
        const startTime = Date.now();
        try {
            // 将 Observable 转换为 Promise
            const response = await firstValueFrom(this.httpService.request<T>(config));

            const duration = Date.now() - startTime;
            this.logger.log(`[${label}] 请求成功 - 耗时: ${duration}ms`);

            return response.data;
        } catch (error) {
            this.logger.error(`[${label}] 请求失败: ${error.message}`);
            // 这里可以根据业务抛出自定义异常
            throw error;
        }
    }
}