import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CryptoUtil } from '../utils/crypto.util';
import { XssUtil } from '../utils/xss.util';
import { BYPASS_ENCRYPTION_KEY } from '../decorators/bypass-encryption.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
    private readonly logger = new Logger(EncryptionInterceptor.name);
    // 防重放攻击的时间窗口：60秒
    private readonly REPLAY_WINDOW_MS = 60000;

    constructor(
        private readonly reflector: Reflector,
        private readonly eventEmitter: EventEmitter2
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // 检查是否跳过加密
        const bypass = this.reflector.getAllAndOverride<boolean>(BYPASS_ENCRYPTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        
        let opData = request.method === 'GET' ? request.query : request.body;

        if (bypass) {
            if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
                this.eventEmitter.emit('user.opration', { req: request, data: opData });
            }
            return next.handle();
        }

        // 处理请求解密
        if (request.method !== 'GET' && request.body && request.body.data) {
            try {
                // 1. 解密
                const decryptedData = CryptoUtil.decrypt(request.body.data);

                if (typeof decryptedData === 'object' && decryptedData !== null) {
                    const { sign, timestamp, nonce, ...businessData } = decryptedData;

                    // 2. 验证防重放 (时间戳超时校验)
                    if (timestamp) {
                        const now = Date.now();
                        if (Math.abs(now - timestamp) > this.REPLAY_WINDOW_MS) {
                            throw new BadRequestException('请求已过期，可能存在重放攻击风险');
                        }
                    }

                    // 3. 验证签名 (签名应是对剔除 sign 后的整个 payload 进行的)
                    if (sign) {
                        const dataWithoutSign = { ...businessData };
                        if (timestamp) dataWithoutSign.timestamp = timestamp;
                        if (nonce) dataWithoutSign.nonce = nonce;

                        const isValid = CryptoUtil.verify(dataWithoutSign, sign);
                        if (!isValid) {
                            throw new BadRequestException('数据签名校验失败，可能被篡改');
                        }
                    }

                    // 4. XSS 净化 (只净化业务参数)
                    const sanitizedBusinessData = XssUtil.sanitize(businessData);

                    // 5. 替换 body 为安全的业务数据
                    request.body = sanitizedBusinessData;
                    opData = sanitizedBusinessData;

                } else {
                    // 如果不是对象，一般不需要签名和防重放
                    request.body = XssUtil.sanitize(decryptedData);
                    opData = request.body;
                }

            } catch (error) {
                this.logger.error(`Decryption or Validation failed: ${error.message}`);
                throw new BadRequestException(error.message || 'Decryption failed');
            }
        }

        // 记录操作日志 (仅记录写操作)
        if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
            this.eventEmitter.emit('user.opration', { req: request, data: opData });
        }

        return next.handle().pipe(
            map((data) => {
                // 处理响应加密
                // 1. 生成防重放时间戳和原始数据一同签名
                const responsePayload = {
                    ...data,
                    timestamp: Date.now()
                };

                // 2. 签名
                const sign = CryptoUtil.sign(responsePayload);

                // 3. 合并签名并通过 AES 加密
                return {
                    data: CryptoUtil.encrypt({ ...responsePayload, sign }),
                };
            }),
        );
    }
}
