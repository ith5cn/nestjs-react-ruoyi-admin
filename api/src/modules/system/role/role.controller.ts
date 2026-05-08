import { BaseController } from "@/common/controllers/base.controller";
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { RoleEntity } from "./entities/role.entity";
import { RoleService } from "./role.service";
import { BypassEncryption } from "@/common/decorators/bypass-encryption.decorator";
import { listToTree } from "@/common/utils/child.utils";
import { RoleDto } from "./dto/role.dto";
import { ApiException } from "@/common/exceptions/api.exception";


// @BypassEncryption()
@Controller('system/role')

export class RoleController extends BaseController<RoleEntity> {
    constructor(private readonly roleService: RoleService) { super(roleService); }

    /**
     * 角色列表
     */
    @Get('index')
    async index(@Query() query: any) {
        const where = this.roleService.buildWhere(query, {
            likes: ['name', 'code'],
            equals: ['status']
        });

        const order: any = { sort: 'ASC', id: 'ASC' };

        const data = await this.roleService.getAll({ where, order });
        return listToTree(data);
    }

    /**
     * 新增角色
     */
    @Post('create')
    async create(@Body() data: RoleDto) {
        let { parent_id, ...others } = data
        let level = "0";
        if (parent_id) {
            const parent = await this.roleService.read(parent_id);
            if (!parent) {
                throw new ApiException('10001:角色不存在');
            }
            level = parent.level + ',' + data.parent_id;
        }

        const createData: any = {
            ...others,
            parentId: parent_id ? Number(parent_id) : 0,
            level
        };

        return await this.roleService.create(createData);
    }

    /**
     * 修改角色
     */
    @Put(':id')
    async update(@Param() params, @Body() data: RoleDto) {
        let { parent_id, ...others } = data
        let level = "0";
        if (parent_id) {
            const parent = await this.roleService.read(parent_id);
            if (!parent) {
                throw new ApiException('10001:角色不存在');
            }
            level = parent.level + ',' + data.parent_id;
        }

        const updateData: any = {
            ...others,
            parentId: parent_id ? Number(parent_id) : 0,
            level
        };

        return await this.roleService.update(Number(params.id), updateData);
    }

    /**
     * 删除角色
     */
    @Delete(':id')
    async delete(@Param() params) {
        const role = await this.roleService.read(Number(params.id));
        if (!role) {
            throw new ApiException('10001:角色不存在');
        }
        // 检查是否有子角色
        const children = await this.roleService.getAll({ where: { parentId: Number(params.id) } });
        if (children.length > 0) {
            throw new ApiException('10001:角色下存在子角色，无法删除');
        }
        return await this.roleService.remove(Number(params.id));
    }

    /**
     * 角色绑定菜单
     */
    @Post(':id/menu')
    async bindMenu(@Param() params, @Body() data: { ids: number[] }) {
        return await this.roleService.bindMenu(Number(params.id), data);
    }

    /**
     * 允许访问的角色
     */
    @Get('access')
    async access() {
        return await this.roleService.getAccess()
    }
}