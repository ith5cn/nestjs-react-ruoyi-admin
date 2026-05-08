import { RedisService } from "@/core/redis/redis.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class JwtConfigService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    private getConfig() {
        const config = this.configService.get('security');
        if (!config) {
            throw new Error('jwt配置文件不存在');
        }
        return config;
    }

    /**
     * 根据签名算法获取【公钥】签名值
     */
    async getSecretKey(type: string) {

    }

    /**
    * 生成 token
    * @param payload 载荷
    * @param type 令牌类型 system
    * @returns 生成 token
    */
    async generateToken(payload: { type: string; sub: any }) {
        const { type } = payload;
        let secret = this.getConfig()[`${type}Secret`];
        let expiresIn = this.getConfig()[`${type}ExpiresIn`];
        let refreshSecret = this.getConfig()[`${type}RefreshSecret`];
        let refreshExpiresIn = this.getConfig()[`${type}RefreshExpiresIn`];
        let refreshToken = ""

        const accessToken = await this.makeToken(payload, secret, expiresIn);

        // 如果没有禁用刷新token，则生成
        if (!this.getConfig().refreshDisable || this.getConfig().refreshDisable === 'false') {
            refreshToken = await this.makeToken(payload, refreshSecret, refreshExpiresIn);
        }

        // 是否开启单设备登录
        if (this.getConfig().singleDeviceLogin && this.getConfig().singleDeviceLogin !== 'false') {
            // 单设备登
            await this.handleSingleDeviceToken(payload, accessToken, refreshToken)
        }

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn
        }


    }

    /**
     * 处理单设备登录
     */
    async handleSingleDeviceToken(payload: any, accessToken: string, refreshToken: string) {
        let { type, sub } = payload;
        const cacheTokenPrefix = this.getConfig().cacheTokenPrefix;
        const refreshCacheTokenPrefix = this.getConfig().refreshCacheTokenPrefix;

        const redisKey = `${cacheTokenPrefix}:${type}:${sub.id}`;
        await this.redisService.set(redisKey, accessToken);

        console.log("redisKey", redisKey)

        if (refreshToken) {
            const refreshRedisKey = `${refreshCacheTokenPrefix}:${type}:${sub.id}`;
            await this.redisService.set(refreshRedisKey, refreshToken);
        }
    }

    /**
     * 制作token
     */
    async makeToken(payload: any, secret: string, expiresIn: number) {
        return await this.jwtService.signAsync(payload, {
            secret,
            expiresIn,
        });
    }

    /**
     * 验证token
     */
    async verifyToken(type: string, token: string) {
        return await this.jwtService.verifyAsync(token, {
            secret: this.getConfig()[`${type}RefreshSecret`],
        });
    }


}