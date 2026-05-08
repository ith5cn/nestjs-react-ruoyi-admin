import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from '@/core/redis/redis.service';
import { MenuService } from '@/system/menu/menu.service';
import { UserService } from '@/system/user/user.service';
import { ApiException } from '@/common/exceptions/api.exception';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private redisService: RedisService,
        private menuService: MenuService,
        private userService: UserService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('__public_key__', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as any;

        // 如果没有用户信息（可能没经过登录校验），交给其它守卫处理
        if (!user || !user.id) {
            return true;
        }

        // 超管直接放行
        if (user.roles && user.roles.includes(1)) {
            return true;
        }

        const path = request.path;
        const method = request.method;


        // // 计算当前请求所需的权限 code
        // const requiredCode = this.getRequiredPermissionCode(method, path);

        // 1. 获取系统所有的权限 code（考虑性能，可以加缓存，这里暂时每次拿，之后如果遇到性能瓶颈可加上 Redis）
        let allCodesCache = await this.redisService.get('system_all_menu_codes');
        let allCodes: string[] = [];
        if (allCodesCache) {
            allCodes = JSON.parse(allCodesCache);
        } else {
            allCodes = await this.menuService.getAllCodes();
            await this.redisService.set('system_all_menu_codes', JSON.stringify(allCodes));
        }

        // 2. 如果该 code 根本没有在系统菜单中配置过权限，说明该接口不需要权限控制，直接放行
        if (!allCodes.includes(path)) {
            return true;
        }

        // 3. 检查当前用户是否拥有该 code
        let cacheUserStr = await this.redisService.get(`system_user_info_${user.id}`);
        if (!cacheUserStr) {
            // 如果缓存被清除（如菜单更新或角色更新时），则静默重新拉取并重建缓存
            try {
                await this.userService.getCurrentSystemUser({ id: user.id });
                cacheUserStr = await this.redisService.get(`system_user_info_${user.id}`);
                if (!cacheUserStr) {
                    throw new Error('重建缓存失败');
                }
            } catch (error) {
                throw new ApiException(403, '权限已更新或被拒绝，请重新登录');
            }
        }

        const cacheUser = JSON.parse(cacheUserStr);
        const userCodes: string[] = cacheUser.codes || [];
        // 这个就是超级管理员
        if (cacheUser.codes === '*') {
            return true
        }

        // 非管理员
        if (userCodes.includes(path)) {
            return true;
        }

        throw new ApiException(403, '您没有权限执行此操作');
    }

}
