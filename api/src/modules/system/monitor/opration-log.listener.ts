import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AddressUtils } from 'src/common/utils/address.utils';
import { OperLogService } from '../oper-log/oper-log.service';

@Injectable()
export class OprationLogListener {
    constructor(private readonly operLogService: OperLogService) { }

    @OnEvent('user.opration', { async: true }) // 关键：开启异步
    async handleOprationEvent(payload: { req: any, data: any }) {

        console.log("进来")
        const { req, data } = payload;

        // 解析 IP 和 浏览器信息
        const info = AddressUtils.getLoginInfo(req);

        // 从请求中获取用户信息 (有些接口可能尚未登录，所以要做判空)
        const username = req.user?.username || '未知用户';

        // 获取业务名称
        const serviceName = await this.operLogService.getServiceName(req.url);



        // 组装标准的日志对象
        await this.operLogService.create({
            username: username,
            ip: info.ip,
            ipLocation: info.ipLocation,
            app: 'system',
            method: req.method,
            router: req.url,
            serviceName: serviceName,
            requestData: JSON.stringify(data),
            remark: '',
        });
    }
}