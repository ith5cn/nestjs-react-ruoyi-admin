import { BaseController } from "@/common/controllers/base.controller";
import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { UserEntity } from "./entities/user.entity";
import { UserService } from "./user.service";
import { BypassEncryption } from "@/common/decorators/bypass-encryption.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { RedisService } from "@/core/redis/redis.service";

@Controller('system/user')
export class UserController extends BaseController<UserEntity> {
    constructor(
        private readonly userService: UserService,
        private readonly redisService: RedisService
    ) {
        super(userService);
    }

    /**
     * 用户列表
     * @param query 
     * @returns 
     */
    // @BypassEncryption()
    @Get('index')
    async index(@Query() query: any) {
        let { page = 1, limit = 10, size, ...options } = query;
        const pageSize = Number(size || limit);
        const pageNum = Number(page);

        const where = this.userService.buildWhere(options, {
            likes: ['username', 'nickname', 'phone', 'email'],
            equals: ['status', 'deptId']
        });
        // 按照sort排序
        const order: any = { id: "ASC" }
        const data = await this.userService.getList(pageNum, pageSize, { where, order, relations: ['roles'] });

        return data;
    }


    /**
     * 设置密码
     */
    // @BypassEncryption()
    @Put(':id/set-password')
    async setPassword(@Param('id') id: string, @Body() data: any) {

        return await this.userService.setPassword(id, data)
    }

    /**
     * 绑定角色
     */
    // @BypassEncryption()
    @Post(':id/role')
    async bindRole(@Param('id') id: string, @Body() data: { ids: number[] }) {
        return await this.userService.bindRole(id, data)
    }

    /**
     * 刷新用户缓存
     */
    // @BypassEncryption()
    @Put(':id/refresh-cache')
    async refreshCache(@Param('id') id: string) {
        return await this.userService.refreshCache(Number(id));
    }

    /**
     * 获取当前用户信息
     */
    @Get()
    async getCurrentUser(@CurrentUser() user: any) {
        return await this.userService.getCurrentSystemUser(user);
    }

    /**
     * 获取用户选择下拉
     */
    @Get('auth-list')
    async authList(@CurrentUser() user: any) {
        return await this.userService.authList(user);
    }

}
