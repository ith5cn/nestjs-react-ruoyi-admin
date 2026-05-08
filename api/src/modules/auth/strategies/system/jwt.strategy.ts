import { RedisService } from '@/core/redis/redis.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { ApiException } from 'src/common/exceptions/api.exception'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "system-access-token") {
    constructor(
        private configSevice: ConfigService,
        private redisService: RedisService
    ) {
        const jwtSecret = configSevice.get<string>('security.systemSecret') || '';
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            passReqToCallback: true,
            secretOrKey: jwtSecret,
        })
    }

    async validate(req: Request, payload: any) {
        // 读取配置的前缀，为了防止和 jwt.service 耦合强硬编码，这里推荐也从配置里拿，或者保持硬编码和那边配置一致。
        // 因为那边在 jwt.config.ts 里有 cacheTokenPrefix 配置。
        const cacheTokenPrefix = this.configSevice.get<string>('security.cacheTokenPrefix');
        // console.log(payload)
        const redisKey = `${cacheTokenPrefix}:${payload.type}:${payload.sub.id}`;

        // console.log(redisKey)



        // 从请求头中获取 token
        const token = req.headers.authorization?.replace('Bearer ', '');

        // 开启单设备登录
        if (this.configSevice.get<string>('security.singleDeviceLogin') === 'true') {
            const cacheSystemUserInfo = await this.redisService.get(redisKey);
            // 如果缓存的 token 不存在，则抛出未授权异常
            if (!cacheSystemUserInfo) {
                throw new ApiException(401, "token已经过期，请重新登录");
            }
            if (cacheSystemUserInfo !== token) {
                throw new ApiException(402, "当前账号已在其他设备登录");
            }
        }
        // 返回用户信息对象，此对象将被挂载在 request.user 上
        return {
            ...payload.sub,
            type: payload.type,
        };
    }
}
