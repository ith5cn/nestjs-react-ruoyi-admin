import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { BaseController } from "@/common/controllers/base.controller";
import { ConfigEntity } from "../entities/config.entity";
import { ConfigService } from "../service/config.service";
import { get } from "axios";
import { query } from "winston";

@Controller("system/config")
export class ConfigController extends BaseController<ConfigEntity> {
  constructor(private readonly configService: ConfigService) {
    super(configService);
  }

  @Get("index")
  async index(@Query() query: any) {
    return await this.configService.getConfigList(query);
  }

  @Post("batch-update")
  async batchUpdate(@Body() body: { group_id: number; config: Array<Partial<ConfigEntity>> }) {
    return await this.configService.batchUpdate(Number(body.group_id), body.config || []);
  }

  @Get('get-config-info')
  async getConfigInfo(@Query() query: any){
    return await this.configService.getConfigInfo(query.code);
  }
}
