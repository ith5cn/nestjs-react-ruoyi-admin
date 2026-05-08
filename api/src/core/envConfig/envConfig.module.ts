import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import envConfigValidationSchema from "./envConfigValidation.schema";
import DatabaseConfig from "./config/database/database.config";
import RedisConfig from "./config/redis/redis.config";
import JwtConfig from "./config/jwt/jwt.config";
import tencentCloundConfig from "./config/tencent-clound/tencent-clound.config";

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // 按照环境不一样加载不同的配置文件
        load: [DatabaseConfig, RedisConfig, JwtConfig, tencentCloundConfig],
        validationSchema: envConfigValidationSchema
    })],
    providers: [],
    exports: []
})
export class EnvConfigModule { }