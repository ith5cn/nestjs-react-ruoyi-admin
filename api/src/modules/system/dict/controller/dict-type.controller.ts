import { Controller, Get, Query } from "@nestjs/common";
import { BaseController } from "@/common/controllers/base.controller";
import { DictTypeEntity } from "../entities/dict-type.entity";
import { DictTypeService } from "../services/dict-type.service";

@Controller('system/dict-type')
export class DictTypeController extends BaseController<DictTypeEntity> {
    constructor(private readonly dictTypeService: DictTypeService) {
        super(dictTypeService);
    }

    /**
     * 列表
     */
    @Get('index')
    async index(@Query() query: any) {
        let { page = 1, limit = 10, ...options } = query;
        const pageSize = Number(limit);
        const pageNum = Number(page);

        const where = this.dictTypeService.buildWhere(options, {
            likes: ['name', 'code'],
            equals: ['status']
        });

        // 按照sort排序
        const order: any = { id: "ASC" };
        const data = await this.dictTypeService.getList(pageNum, pageSize, { where, order });

        return data;
    }
}