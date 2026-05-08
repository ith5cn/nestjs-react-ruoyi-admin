import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { BaseService } from "@/common/services/base.service";
import { ApiException } from "@/common/exceptions/api.exception";
import { ConfigGroupEntity } from "../entities/config-group.entity";
import { ConfigService } from "./config.service";

@Injectable()
export class ConfigGroupService extends BaseService<ConfigGroupEntity> {
  private readonly systemReservedGroupIds = [1, 2, 3];

  constructor(
    @InjectRepository(ConfigGroupEntity)
    private readonly configGroupRepository: Repository<ConfigGroupEntity>,
    private readonly configService: ConfigService,
  ) {
    super(configGroupRepository);
  }

  async getConfigGroupList(query: any) {
    const where: any = {};
    if (query.name) {
      where.name = Like(`%${String(query.name).trim()}%`);
    }
    if (query.code) {
      where.code = Like(`%${String(query.code).trim()}%`);
    }

    return await this.configGroupRepository.find({
      where,
      order: { id: "ASC" },
    });
  }

  override async remove(id: any): Promise<void> {
    const groupId = Number(id);
    if (this.systemReservedGroupIds.includes(groupId)) {
      throw new ApiException("系统核心配置分组不允许删除");
    }

    await this.configGroupRepository.manager.transaction(async (manager) => {
      await manager.getRepository(ConfigGroupEntity).delete(groupId);
      await this.configService.removeByGroupId(groupId);
    });
  }
}
