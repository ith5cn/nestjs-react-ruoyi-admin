import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/system/jwt.strategy";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "@/system/user/user.module";
import { MenuModule } from "@/system/menu/menu.module";
import { JwtConfigService } from "@/core/envConfig/config/jwt/jwt.service";

@Module({
    imports: [
        // 1. 注册 Passport 模块，指定默认策略为 '系统访问令牌'
        PassportModule.register({ defaultStrategy: 'system-access-token' }),

        // 2. 异步注册 JwtModule，从配置中心读取密钥
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('jwt.access_secret_key'),
                signOptions: {
                    expiresIn: config.get<number>('jwt.access_exp') ?? 7200,
                },
            }),
        }),
        UserModule,
        MenuModule,
    ],
    providers: [AuthService, JwtStrategy, JwtConfigService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
