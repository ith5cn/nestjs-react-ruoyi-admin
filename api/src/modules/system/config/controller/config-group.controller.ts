import { Controller, Get, Query } from "@nestjs/common";
import { BaseController } from "@/common/controllers/base.controller";
import { ConfigGroupEntity } from "../entities/config-group.entity";
import { ConfigGroupService } from "../service/config-group.service";

@Controller("system/config-group")
export class ConfigGroupController extends BaseController<ConfigGroupEntity> {
  constructor(private readonly configGroupService: ConfigGroupService) {
    super(configGroupService);
  }

  @Get("index")
  async index(@Query() query: any) {
    return await this.configGroupService.getConfigGroupList(query);
  }
}
