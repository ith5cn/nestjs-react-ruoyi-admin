import { BaseController } from "@/common/controllers/base.controller";
import { Controller, Get, Query } from "@nestjs/common";
import { OperLogEntity } from "./entities/oper-log.entity";
import { OperLogService } from "./oper-log.service";

@Controller("system/oper-log")
export class OperLogController extends BaseController<OperLogEntity> {
  constructor(private readonly operLogService: OperLogService) {
    super(operLogService);
  }

  @Get("index")
  async index(@Query() query: any) {
    const { page = 1, limit = 10, size, ...options } = query;
    const pageSize = Number(size || limit);
    const pageNum = Number(page);
    const where = this.operLogService.buildWhere(options, { likes: ['username', 'serviceName', 'router', 'ip'], equals: ['createTime'] });
    const order: any = { id: "DESC" };
    return await this.operLogService.getList(pageNum, pageSize, { where, order });
  }
}
