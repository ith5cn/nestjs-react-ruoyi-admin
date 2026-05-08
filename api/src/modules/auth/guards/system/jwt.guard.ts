import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiException } from '@/common/exceptions/api.exception';

@Injectable()
export class JwtSystemAccessGuard extends AuthGuard('system-access-token') {
    constructor(private reflector: Reflector) {
        super();
    }
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>('__public_key__', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();

        return super.canActivate(context);
    }
    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw err || new ApiException(401, '未授权，请先登录');
        }
        return user;
    }
}