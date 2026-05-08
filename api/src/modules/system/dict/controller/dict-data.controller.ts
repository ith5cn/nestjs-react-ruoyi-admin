import { Controller, Get, Query } from "@nestjs/common";
import { BaseController } from "@/common/controllers/base.controller";
import { DictDataEntity } from "../entities/dict-data.entity";
import { DictDataService } from "../services/dict-data.service";

@Controller('system/dict-data')
export class DictDataController extends BaseController<DictDataEntity> {
    constructor(private readonly dictDataService: DictDataService) {
        super(dictDataService);
    }

    @Get('index')
    async index(@Query() query: any) {
        let { page = 1, limit = 10, ...options } = query;
        const pageSize = Number(limit);
        const pageNum = Number(page);

        const where = this.dictDataService.buildWhere(options, {
            likes: ['name', 'code'],
            equals: ['status', 'typeId']
        });

        // 按照sort排序
        const order: any = { sort: 'ASC', id: "ASC" };
        const data = await this.dictDataService.getList(pageNum, pageSize, { where, order });

        return data;
    }

    @Get("dictAll")
    async dictAll() {
        const data = await this.dictDataService.getdictAll()
        return data;
    }
}
