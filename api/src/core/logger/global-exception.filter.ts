import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // 提取错误响应（支持字符串和对象两种格式）
        let message: string;
        let errorCode: number | undefined;
        let errors: any[] | undefined;

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const res = exceptionResponse as Record<string, any>;
                message = res.message || exception.message;
                errorCode = res.code; // ApiException 中自定义的业务错误码
                errors = res.errors; // Zod 校验的字段级错误
            } else {
                message = exception.message;
            }
        } else {
            message = 'Internal Server Error';
        }

        const stack = exception instanceof Error ? exception.stack : '';

        // 写入错误日志
        this.logger.error(
            `[${request.method}] ${request.originalUrl} - ${status} - ${message}`,
            stack,
            'GlobalExceptionFilter',
        );

        // 返回错误响应，优先使用 ApiException 中的业务错误码
        const responseBody: Record<string, any> = {
            code: errorCode ?? status,
            message: message,
            timestamp: new Date().toISOString(),
            path: request.originalUrl,
        };

        if (errors) {
            responseBody.errors = errors;
        }

        response.status(200).json(responseBody);
    }
}

