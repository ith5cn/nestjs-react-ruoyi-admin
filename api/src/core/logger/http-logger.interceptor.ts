import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const { method, originalUrl, ip, body, query } = request;
        const userAgent = request.get('user-agent') || '';
        const startTime = Date.now();

        // 记录请求
        const requestLog = [
            `→ [${method}] ${originalUrl}`,
            `  IP: ${ip}`,
            `  User-Agent: ${userAgent}`,
        ];
        if (Object.keys(query).length > 0) {
            requestLog.push(`  Query: ${JSON.stringify(query)}`);
        }
        if (body && Object.keys(body).length > 0) {
            requestLog.push(`  Body: ${JSON.stringify(body)}`);
        }
        this.logger.httpLog(requestLog.join('\n'));

        return next.handle().pipe(
            tap({
                next: (responseBody) => {
                    const duration = Date.now() - startTime;
                    const statusCode = response.statusCode;

                    const responseLog = [
                        `← [${method}] ${originalUrl} - ${statusCode} - ${duration}ms`,
                        `  Response: ${JSON.stringify(responseBody)}`,
                    ];
                    this.logger.httpLog(responseLog.join('\n'));
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    const statusCode = error?.status || 500;

                    const errorLog = [
                        `← [${method}] ${originalUrl} - ${statusCode} - ${duration}ms`,
                        `  Error: ${error.message}`,
                    ];
                    this.logger.httpLog(errorLog.join('\n'));
                },
            }),
        );
    }
}
