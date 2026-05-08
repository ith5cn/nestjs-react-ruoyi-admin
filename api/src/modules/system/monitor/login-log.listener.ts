import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AddressUtils } from 'src/common/utils/address.utils';
import { NestSystemLoginLogService as LoginLogService } from '../login-log/login-log.service';
import { RequestContextService } from '@/core/context/request-context.service';
import dayjs from 'dayjs';

@Injectable()
export class LoginLogListener {
    constructor(
        private readonly loginLogService: LoginLogService,
        private readonly requestContext: RequestContextService,
    ) { }

    @OnEvent('user.login', { async: true }) // 关键：开启异步
    async handleLoginEvent(payload: { user: any; message: string; status: number }) {
        const { user, message, status } = payload;

        // 从 AsyncLocalStorage 上下文中获取请求信息
        const requestInfo = this.requestContext.getRequestInfo();

        // 解析 IP 和 浏览器信息
        const info = AddressUtils.getLoginInfoFromContext(requestInfo);


        // 组装若依标准的日志对象
        await this.loginLogService.create({
            username: user?.username,
            ip: info.ip,
            ipLocation: info.ipLocation,
            os: info.os,
            browser: info.browser,
            status,
            message,
            loginTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });

    }
}