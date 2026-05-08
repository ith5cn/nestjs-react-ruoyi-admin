import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { RedisService } from "@/core/redis/redis.service";
import { RequestContextService } from "@/core/context/request-context.service";

@Injectable()
export class RequestInterceptor implements NestInterceptor {
    constructor(
        private readonly redisService: RedisService,
        private readonly requestContext: RequestContextService,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        let userInfo = user ? { ...user } : undefined;

        // 如果 user 存在（JWT 认证通过后会挂载），从 Redis 读取完整用户信息
        if (user?.id) {
            const cachedUserInfo = await this.redisService.get(`system_user_info_${user.id}`);
            if (cachedUserInfo) {
                try {
                    const parsed = JSON.parse(cachedUserInfo);
                    userInfo = { ...user, ...parsed };
                    request.user = userInfo;
                } catch (e) {
                    // JSON 解析失败，保持原有 user 不变
                }
            }
        }

        // 提取请求元数据（IP、User-Agent、Headers）
        const requestInfo = {
            ip: (request.headers['x-forwarded-for'] as string) || request.ip || '127.0.0.1',
            userAgent: request.headers['user-agent'] || '',
            headers: request.headers,
        };

        // 将用户信息和请求元数据存入 AsyncLocalStorage 上下文
        return new Observable((subscriber) => {
            this.requestContext.run({ user: userInfo, requestInfo }, () => {
                next.handle().subscribe({
                    next: (value) => subscriber.next(value),
                    error: (err) => subscriber.error(err),
                    complete: () => subscriber.complete(),
                });
            });
        });
    }
}