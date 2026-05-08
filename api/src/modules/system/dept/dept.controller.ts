import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { BaseController } from "@/common/controllers/base.controller";
import { DeptEntity } from "./entities/dept.entity";
import { DeptService } from "./dept.service";
import { listToTree } from "@/common/utils/child.utils";

import { DeptDto } from "./dto/dept.dto";
import { ApiException } from "@/common/exceptions/api.exception";

@Controller('system/dept')
export class DeptController extends BaseController<DeptEntity> {
    constructor(private readonly deptService: DeptService) { super(deptService); }

    /**
     * 部门列表
     */
    @Get('index')
    async index(@Query() query: any) {
        const where = this.deptService.buildWhere(query, {
            likes: ['name'],
            equals: ['parentId', 'status']
        });

        const order: any = { sort: 'ASC', id: 'ASC' };

        const data = await this.deptService.getAll({ where, order });
        return listToTree(data);
    }

    /**
     * 创建部门
     */
    @Post()
    async create(@Body() data: DeptDto) {
        let { parent_id, ...dept } = data
        let level = "0";
        if (parent_id) {
            const parent = await this.deptService.read(parent_id);
            if (!parent) {
                throw new ApiException('父部门不存在');
            }
            level = parent.level + ',' + data.parent_id;
        }

        const createData: any = {
            ...dept,
            parentId: parent_id ? Number(parent_id) : 0,
            level
        };

        return await this.deptService.create(createData);
    }

    /**
     * 更新部门
     */
    @Put(':id')
    async update(@Param() params, @Body() data: DeptDto) {

        let { parent_id, ...dept } = data
        let level = "0";
        if (parent_id) {
            const parent = await this.deptService.read(parent_id);
            if (!parent) {
                throw new ApiException('父部门不存在');
            }
            level = parent.level + ',' + data.parent_id;
        }

        const updateData: any = {
            ...dept,
            parentId: parent_id ? Number(parent_id) : 0,
            level
        };

        return await this.deptService.update(Number(params.id), updateData);
    }

    /**
     * 删除部门
     */
    @Delete(':id')
    async delete(@Param() params) {
        const dept = await this.deptService.read(Number(params.id));
        if (!dept) {
            throw new ApiException('10001:部门不存在');
        }
        // 检查是否有子部门
        const children = await this.deptService.getAll({ where: { parentId: Number(params.id) } });
        if (children.length > 0) {
            throw new ApiException('10001:部门下存在子部门，无法删除');
        }
        return await this.deptService.remove(Number(params.id));
    }

    /**
     * 可操作的部门
     */
    @Get("access")
    async access(@Query() query: { status: number, tree?: boolean }) {
        let { status = 1, tree = false } = query;
        const data = await this.deptService.accessDept({ status: Number(status), tree });
        return data;
    }
}