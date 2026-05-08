import { BaseController } from "@/common/controllers/base.controller";
import { Controller, Get, Query } from "@nestjs/common";
import { NestSystemLoginLogEntity } from "./entities/login-log.entity";
import { NestSystemLoginLogService } from "./login-log.service";

@Controller("system/login-log")
export class NestSystemLoginLogController extends BaseController<NestSystemLoginLogEntity> {
  constructor(private readonly nestSystemLoginLogService: NestSystemLoginLogService) {
    super(nestSystemLoginLogService);
  }

  @Get("index")
  async index(@Query() query: any) {
    const { page = 1, limit = 10, size, ...options } = query;
    const pageSize = Number(size || limit);
    const pageNum = Number(page);
    const where = this.nestSystemLoginLogService.buildWhere(options, { likes: ['username'], equals: ['status', 'ip', 'loginTime'] });
    const order: any = { id: "DESC" };
    return await this.nestSystemLoginLogService.getList(pageNum, pageSize, { where, order });
  }
}
