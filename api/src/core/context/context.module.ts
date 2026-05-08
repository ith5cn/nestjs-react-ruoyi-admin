import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

/**
 * 全局上下文模块
 * @Global 装饰器使 RequestContextService 在所有模块中可用，无需手动导入
 */
@Global()
@Module({
    providers: [RequestContextService],
    exports: [RequestContextService],
})
export class ContextModule { }
