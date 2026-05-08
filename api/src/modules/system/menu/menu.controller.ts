import { BaseController } from "@/common/controllers/base.controller";
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { MenuEntity } from "./entities/menu.entity";
import { MenuService } from "./menu.service";
import { MenuDto } from "./dto/menu.dto";
import { BypassEncryption } from "@/common/decorators/bypass-encryption.decorator";
import { listToTree } from "@/common/utils/child.utils";
import { ApiException } from "@/common/exceptions/api.exception";
import { CurrentUser } from "@/common/decorators/current-user.decorator";

import { Like } from "typeorm";

@Controller('system/menu')
export class MenuController extends BaseController<MenuEntity> {
    constructor(private readonly menuService: MenuService) { super(menuService); }

    /**
     * 菜单列表
     */
    // @BypassEncryption()
    @Get('index')
    async getMenuList(@Query() query: any) {
        const where = this.menuService.buildWhere(query, {
            likes: ['name', 'code'],
            equals: ['status']
        });
        // 按照sort排序
        const order: any = { sort: "ASC", id: "ASC" }
        const data = await this.menuService.getAll({ where, order });
        return { data: listToTree(data) };
    }

    /**
     * 新增菜单
     */
    // @BypassEncryption()
    @Post('create')
    async createMenu(@Body() menuDto: MenuDto) {

        let { parentId, isHidden, isLayout, ...menu } = menuDto;
        let level = "0";

        // 检查父菜单
        if (parentId) {
            let parentMenu = await this.menuService.getMenuById(Number(parentId));
            if (!parentMenu) {
                throw new Error('父菜单不存在');
            }
            level = `${parentMenu.level},${parentId}`
        }

        const createData: any = {
            ...menu,
            parentId: parentId ? Number(parentId) : 0,
            isHidden,
            isLayout,
            level
        };

        return await this.menuService.create(createData);
    }

    /**
     * 更新菜单
     */
    // @BypassEncryption()
    @Put(':id')
    async updateMenu(@Param() params, @Body() menuDto: MenuDto) {

        let { parentId, isHidden, isLayout, ...menu } = menuDto;
        let level = "0";

        // 检查父菜单
        if (parentId) {
            let parentMenu = await this.menuService.getMenuById(Number(parentId));
            if (!parentMenu) {
                throw new Error('父菜单不存在');
            }
            level = `${parentMenu.level},${parentId}`
        }

        const updateData: any = {
            ...menu,
            parentId: parentId ? Number(parentId) : 0,
            isHidden,
            isLayout,
            level
        };

        return await this.menuService.update(Number(params.id), updateData);
    }

    /**
     * 删除菜单
     */
    // @BypassEncryption()
    @Delete(':id')
    async deleteMenu(@Param() params) {
        const menu = await this.menuService.getMenuById(Number(params.id));
        if (!menu) {
            throw new ApiException('10001:菜单不存在');
        }
        // 检查是否有子菜单
        const children = await this.menuService.getMenusByParentId(Number(params.id));
        if (children.length > 0) {
            throw new ApiException('10001:菜单下存在子菜单，无法删除');
        }
        return await this.menuService.remove(Number(params.id));
    }

    /**
     * 获取权限的菜单
     * 1. 获取当前登录用户的角色
     * 2. 获取角色的权限
     * 3. 获取权限的菜单
     * 传入 user_id
     */
    // @BypassEncryption()
    @Get('permissions')
    async getPermissionsMenu(@CurrentUser() user: any) {
        return await this.menuService.getPermissionsMenu(user.id);
    }

    /**
     * 获取当前用户的权限代码数组 (codes)
     * e.g. ["system:user:add", "system:role:edit"] 或超管 ["*"]
     */
    // @BypassEncryption()
    @Get('codes')
    async getCodes(@CurrentUser() user: any) {
        return await this.menuService.getCodes(user.id);
    }

    /**
     * 获取当前登录用户可访问的菜单树（用于角色分配菜单权限时展示）
     */
    // @BypassEncryption()
    @Get('accessMenu')
    async accessMenu(@CurrentUser() user: any) {
        return await this.menuService.getPermissionsMenu(user.id);
    }

    /**
     * 获取角色已拥有的菜单ID列表（用于回显）
     */
    // @BypassEncryption()
    @Get('getMenuByRole/:roleId')
    async getMenuByRole(@Param('roleId') roleId: string) {
        return await this.menuService.getMenuIdsByRoleId(Number(roleId));
    }
}
