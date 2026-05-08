import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseService } from "@/common/services/base.service";
import { OperLogEntity } from "./entities/oper-log.entity";
import { MenuService } from "../menu/menu.service";

@Injectable()
export class OperLogService extends BaseService<OperLogEntity> {
  constructor(
    @InjectRepository(OperLogEntity)
    private readonly operLogRepository: Repository<OperLogEntity>,
    private readonly menuService: MenuService
  ) {
    super(operLogRepository);
  }


  /**
   * 获取业务名称
   */
  async getServiceName(path: string) {
    const menu = await this.menuService.getMenuByRouteUrl(path);
    if (menu) {
      return menu.name;
    } else {
      return '未命名业务';
    }
  }
}
