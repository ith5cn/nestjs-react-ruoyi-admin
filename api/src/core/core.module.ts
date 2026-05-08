import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module";
import { EnvConfigModule } from "./envConfig/envConfig.module";
import { RedisModule } from "./redis/redis.module";
import { ContextModule } from "./context/context.module";
import { LoggerModule } from "./logger/logger.module";
import { HttpLoggerInterceptor } from "./logger/http-logger.interceptor";
import { EncryptionInterceptor } from "../common/interceptors/encryption.interceptor";
import { GlobalExceptionFilter } from "./logger/global-exception.filter";
import { ResponseInterceptor } from "./interceptor/response.interceptor";
import { RequestInterceptor } from "./interceptor/request.interceptor";
import { ZodValidationPipe } from "./pipes/zod-validation.pipe";
import { ClientHttpModule } from "./client-http/client-http.module";

@Module({
    imports: [DatabaseModule, EnvConfigModule, RedisModule, LoggerModule, ClientHttpModule, ContextModule],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: EncryptionInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpLoggerInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        }
    ],
    exports: [ClientHttpModule]
})

export class CoreModule { }



