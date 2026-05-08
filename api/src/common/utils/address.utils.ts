
import IP2Region from 'ip2region';
import { UAParser } from 'ua-parser-js';
import { Request } from 'express';

export class AddressUtils {
    private static queryer = new IP2Region(); // 默认使用内置数据文件

    static parseIp(rawIp: string) {
        let ip = rawIp || '127.0.0.1';
        if (ip === '::1' || ip.includes('127.0.0.1')) {
            ip = '127.0.0.1';
        } else if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        return ip;
    }

    static parseLocation(ip: string): string {
        if (ip === '127.0.0.1') {
            return '内网IP';
        }
        let location = '未知';
        try {
            const region = this.queryer.search(ip);
            if (region) {
                const parts = [region.country, region.province, region.city].filter(
                    (p) => p && p !== '0' && p !== 'null' && p !== '未知'
                );
                if (parts.length > 0) {
                    // 对于有些返回可能省市一样，去重处理
                    location = Array.from(new Set(parts)).join(' ');
                }
            }
        } catch (error) {
            // Ignore format errors
        }
        return location;
    }

    static getLoginInfo(req: Request) {
        const ua = new UAParser(req.headers['user-agent']).getResult();

        // 获取真实IP (兼容代理)
        const rawIp = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
        const ip = this.parseIp(rawIp);
        const ipLocation = this.parseLocation(ip);

        return {
            ip,
            ipLocation,
            os: `${ua.os.name || '未知'} ${ua.os.version || ''}`.trim(),
            browser: `${ua.browser.name || '未知'} ${ua.browser.version || ''}`.trim(),
        };
    }

    /**
     * 从 AsyncLocalStorage 上下文中的 requestInfo 解析登录信息
     */
    static getLoginInfoFromContext(requestInfo?: { ip: string; userAgent: string; headers: Record<string, any> }) {
        if (!requestInfo) {
            return { ip: '127.0.0.1', ipLocation: '内网IP', os: '未知', browser: '未知' };
        }

        const ua = new UAParser(requestInfo.userAgent).getResult();
        const rawIp = requestInfo.headers?.['x-forwarded-for'] || requestInfo.ip || '127.0.0.1';
        const ip = this.parseIp(rawIp);
        const ipLocation = this.parseLocation(ip);

        return {
            ip,
            ipLocation,
            os: `${ua.os.name || '未知'} ${ua.os.version || ''}`.trim(),
            browser: `${ua.browser.name || '未知'} ${ua.browser.version || ''}`.trim(),
        };
    }
}