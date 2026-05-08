import { BaseController } from "@/common/controllers/base.controller";
import { Controller, Get, Query } from "@nestjs/common";
import { NoticeEntity } from "./entities/notice.entity";
import { NoticeService } from "./notice.service";

@Controller("system/notice")
export class NoticeController extends BaseController<NoticeEntity> {
  constructor(private readonly noticeService: NoticeService) {
    super(noticeService);
  }

  @Get("index")
  async index(@Query() query: any) {
    const { page = 1, limit = 10, size, ...options } = query;
    const pageSize = Number(size || limit);
    const pageNum = Number(page);
    const where = this.noticeService.buildWhere(options, { likes: ['title', 'remark'], equals: ['type'] });
    const order: any = { id: "DESC" };
    return await this.noticeService.getList(pageNum, pageSize, { where, order });
  }
}
