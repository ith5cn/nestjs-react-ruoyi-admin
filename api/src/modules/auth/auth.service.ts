import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthSystemLoginDto, AuthSystemRefreshTokenDto, AuthSystemRegisterDto } from "./dto/auth-system.dto";
import { UserService } from "@/system/user/user.service";
import { ApiException } from "@/common/exceptions/api.exception";
import { SecurityUtil } from "@/common/utils/security.util";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RedisService } from "@/core/redis/redis.service";
import { MenuService } from "@/system/menu/menu.service";
import dayjs from "dayjs";
import { request } from "@/core/context/request.helper";
import { JwtConfigService } from "@/core/envConfig/config/jwt/jwt.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly menuService: MenuService,
        private eventEmitter: EventEmitter2,
        private readonly redisService: RedisService,
        private readonly jwtConfigService: JwtConfigService,
    ) { }

    /**
     * 系统登录
     */
    async systemLogin(loginDto: AuthSystemLoginDto) {
        const { username, password } = loginDto;

        const user = await this.userService.findByUsername(username);

        let status = 1;
        let message = '登录成功';

        if (!user) {
            message = '账号或密码错误，请重新输入!';
            throw new ApiException(message);
        }
        if (user.status === 2) {
            status = 0;
            message = '您已被禁止登录!';
        }
        const passwordVerify = await SecurityUtil.comparePassword(password, user.password);
        if (!passwordVerify) {
            status = 0;
            message = '账号或密码错误，请重新输入!';
        }

        if (status === 0) {
            this.eventEmitter.emit('user.login', { user, message, status });
            throw new ApiException(message);
        }

        user.loginTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        user.loginIp = request().getRealIp();

        const loginData = await this.jwtConfigService.generateToken({ type: 'system', sub: { id: user.id, username: user.username } });

        // 记录登录日志
        this.eventEmitter.emit('user.login', { user, message: '登录成功', status: 1 });

        return loginData;
    }

    /**
     * 系统注册
     */
    async systemRegister(registerDto: AuthSystemRegisterDto) {
        const { email, password, username } = registerDto;
        const user = await this.userService.findByEmail(email);
        if (user) {
            throw new ApiException('10001:用户已存在');
        }
        const passwordHash = await SecurityUtil.encryptPassword(password);
        const registerUser = await this.userService.create({ email, password: passwordHash, username });
        return registerUser;
    }

    /**
     * 刷新token
     */
    async systemRefreshToken(refreshTokenDto: AuthSystemRefreshTokenDto) {
        const { refreshToken } = refreshTokenDto;

        try {
            // 获取 refresh secret
            const refreshSecret = this.configService.get<string>('security.systemRefreshSecret');

            // 验证 token（如果过期或秘钥不对，会直接报错进入 catch）
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: refreshSecret,
            });

            // 检查单设备登录状态（如果开启）
            const singleDeviceLogin = this.configService.get<string>('security.singleDeviceLogin');
            if (singleDeviceLogin === 'true') {
                const refreshCacheTokenPrefix = this.configService.get<string>('security.refreshCacheTokenPrefix');
                const redisKey = `${refreshCacheTokenPrefix}:${payload.type}:${payload.sub.id}`;
                const cacheRefreshToken = await this.redisService.get(redisKey);

                if (!cacheRefreshToken) {
                    throw new ApiException(401, '刷新令牌已过期，请重新登录');
                }
                if (cacheRefreshToken !== refreshToken) {
                    throw new ApiException(402, '当前账号已在其他设备登录');
                }
            }

            // 验证用户当前状态是否正常（封号、遭删等）
            const user = await this.userService.findByUsername(payload.sub.username);
            if (!user) {
                throw new ApiException(401, '用户不存在，请重新登录');
            }
            if (user.status === 2) {
                throw new ApiException(401, '您已被禁止登录!');
            }

            // 重新生成新 token 对并返回
            return await this.jwtConfigService.generateToken({
                type: 'system',
                sub: { id: user.id, username: user.username },
            });

        } catch (error) {
            // 将我们内部抛出的精确 ApiException 原样抛出
            if (error instanceof ApiException) {
                throw error;
            }
            // JWT 验证错误（过期、被篡改等）兜底拦截
            throw new ApiException(401, '刷新令牌无效或已过期，请重新登录');
        }
    }
}
