import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
    private appLogger: winston.Logger;
    private httpLogger: winston.Logger;

    constructor() {
        const runtimeDir = path.join(process.cwd(), 'runtime', 'logs');

        // 日志格式
        const logFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
                let log = `[${timestamp}] [${level.toUpperCase()}]`;
                if (context) log += ` [${context}]`;
                log += ` ${message}`;
                if (trace) log += `\n${trace}`;
                return log;
            }),
        );

        // 控制台格式（带颜色）
        const consoleFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
                let log = `[${timestamp}] ${level}`;
                if (context) log += ` [${context}]`;
                log += ` ${message}`;
                if (trace) log += `\n${trace}`;
                return log;
            }),
        );

        // 通用轮转配置：保留30天
        const commonRotateOptions = {
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            zippedArchive: false,
        };

        // 应用日志 Logger（app/ + error/ + 控制台）
        this.appLogger = winston.createLogger({
            level: 'debug',
            transports: [
                // 应用日志 — info 及以上
                new winston.transports.DailyRotateFile({
                    ...commonRotateOptions,
                    dirname: path.join(runtimeDir, 'app'),
                    filename: '%DATE%.log',
                    level: 'info',
                    format: logFormat,
                }),

                // 错误日志 — 仅 error
                new winston.transports.DailyRotateFile({
                    ...commonRotateOptions,
                    dirname: path.join(runtimeDir, 'error'),
                    filename: '%DATE%.log',
                    level: 'error',
                    format: logFormat,
                }),

                // 控制台输出
                new winston.transports.Console({
                    format: consoleFormat,
                }),
            ],
        });

        // HTTP 日志 Logger（仅写入 http/）
        this.httpLogger = winston.createLogger({
            level: 'info',
            transports: [
                new winston.transports.DailyRotateFile({
                    ...commonRotateOptions,
                    dirname: path.join(runtimeDir, 'http'),
                    filename: '%DATE%.log',
                    level: 'info',
                    format: logFormat,
                }),
            ],
        });
    }

    /**
     * 获取内部 winston 实例（应用日志）
     */
    getWinstonLogger(): winston.Logger {
        return this.appLogger;
    }

    log(message: string, context?: string) {
        this.appLogger.info(message, { context });
    }

    error(message: string, trace?: string, context?: string) {
        this.appLogger.error(message, { trace, context });
    }

    warn(message: string, context?: string) {
        this.appLogger.warn(message, { context });
    }

    debug(message: string, context?: string) {
        this.appLogger.debug(message, { context });
    }

    verbose(message: string, context?: string) {
        this.appLogger.verbose(message, { context });
    }

    /**
     * 记录 HTTP 请求/响应日志（仅写入 http 分类文件）
     */
    httpLog(message: string) {
        this.httpLogger.info(message, { context: 'HTTP' });
    }
}

