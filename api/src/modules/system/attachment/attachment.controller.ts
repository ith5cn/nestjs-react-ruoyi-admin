import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { BaseController } from "@/common/controllers/base.controller";
import { AttachmentEntity } from "./entities/attachment.entity";
import { AttachmentService } from "./attachment.service";
import { Between } from "typeorm";

@Controller("system/attachment")
export class AttachmentController extends BaseController<AttachmentEntity> {
  constructor(private readonly attachmentService: AttachmentService) {
    super(attachmentService);
  }

  @Get("index")
  async index(@Query() query: any) {
     let { page = 1, limit = 10, ...options } = query;
        const pageSize = Number(limit);
        const pageNum = Number(page);

        if(options.resourceType != 'all'){
            options.mimeType = options.resourceType;
        }
        const where = this.attachmentService.buildWhere(options, {
            likes: ['originName','mimeType'],
            equals: ['storageMode']
        });
        // 按照sort排序
        const order: any = { id: "ASC" };
        const data = await this.attachmentService.getList(pageNum, pageSize, { where, order });
        return data;
        
  }

  @Post("delete")
  async deleteBatch(@Body() dto: { ids?: Array<number | string>; removeSource?: boolean }) {
    return this.attachmentService.removeBatch({
      ids: dto?.ids || [],
      removeSource: dto?.removeSource === true,
    });
  }
}
