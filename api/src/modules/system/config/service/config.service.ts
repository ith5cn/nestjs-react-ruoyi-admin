import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Like, Repository } from "typeorm";
import { BaseService } from "@/common/services/base.service";
import { ApiException } from "@/common/exceptions/api.exception";
import { ConfigEntity } from "../entities/config.entity";
import { ConfigGroupEntity } from "../entities/config-group.entity";

@Injectable()
export class ConfigService extends BaseService<ConfigEntity> {
  constructor(
    @InjectRepository(ConfigEntity)
    private readonly configRepository: Repository<ConfigEntity>,
    @InjectRepository(ConfigGroupEntity)
    private readonly configGroupRepository: Repository<ConfigGroupEntity>,
  ) {
    super(configRepository);
  }

  async getConfigList(query: any) {
    const where: FindOptionsWhere<ConfigEntity> = {};

    if (query.group_id) {
      where.group_id = Number(query.group_id);
    }
    if (query.name) {
      where.name = Like(`%${String(query.name).trim()}%`);
    }
    if (query.key) {
      where.key = Like(`%${String(query.key).trim()}%`);
    }

    const orderBy = query.orderBy || "sort";
    const orderType = String(query.orderType || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const data = await this.configRepository.find({
      where,
      order: {
        [orderBy]: orderType,
        id: "DESC",
      } as any,
    });

    return {
      data: data.map((item) => this.transformConfig(item)),
      total: data.length,
    };
  }

  async batchUpdate(groupId: number, configList: Array<Partial<ConfigEntity>>) {
    if (!groupId) {
      throw new ApiException("配置分组不能为空");
    }
    if (!Array.isArray(configList) || configList.length === 0) {
      throw new ApiException("配置数据不能为空");
    }

    await this.configRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(ConfigEntity);
      for (const item of configList) {
        if (!item.id) continue;
        await repository.update(item.id, {
          value: item.value ?? "",
          name: item.name,
          key: item.key,
          group_id: groupId,
          input_type: item.input_type,
          config_select_data: this.normalizeSelectData(item.config_select_data),
          sort: item.sort,
          remark: item.remark,
        });
      }
    });

    return await this.getConfigList({
      group_id: groupId,
      orderBy: "sort",
      orderType: "DESC",
    });
  }

  async removeByGroupId(groupId: number) {
    if (!groupId) return;
    await this.configRepository.delete({ group_id: groupId });
  }

  async getConfigMapByGroupCode(groupCode: string): Promise<Record<string, string>> {
    if (!groupCode) {
      throw new ApiException("配置分组编码不能为空");
    }

    const group = await this.configGroupRepository.findOne({
      where: { code: groupCode },
    });
    if (!group) {
      throw new ApiException(`配置分组 ${groupCode} 不存在`);
    }

    const rows = await this.configRepository.find({
      where: { group_id: group.id },
      order: { sort: "DESC", id: "DESC" } as any,
    });

    return rows.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value ?? "";
      return acc;
    }, {});
  }

  async getConfigInfo(code:string){
    const group = await this.configGroupRepository.findOne({
      where: { code },
    });
    if (!group) {
      throw new ApiException(`配置分组 ${code} 不存在`);
    }
    const rows = await this.configRepository.find({
      where: { group_id: group.id },
      order: { sort: "DESC", id: "DESC" } as any,
    });
    return rows.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value ?? "";
      return acc;
    }, {});
  }

  override async create(data: Partial<ConfigEntity>): Promise<any> {
    const entity = this.configRepository.create({
      ...data,
      config_select_data: this.normalizeSelectData(data.config_select_data) as any,
    } as any);
    const result = await this.configRepository.save(entity as any);
    return this.transformConfig(result);
  }

  override async update(id: any, data: Partial<ConfigEntity>): Promise<any> {
    await this.configRepository.update(id, {
      ...data,
      config_select_data: this.normalizeSelectData(data.config_select_data) as any,
    } as any);
    const result = await this.read(id);
    return result ? this.transformConfig(result) : null;
  }

  private normalizeSelectData(value: any) {
    if (value == null || value === "") return undefined;
    if (typeof value === "string") {
      return value.replace(/\r/g, "").trim();
    }
    return JSON.stringify(value);
  }

  private transformConfig(item: ConfigEntity): any {
    return {
      ...item,
      config_select_data: this.transformSelectData(item.config_select_data) as any,
    };
  }

  private transformSelectData(value?: string | null) {
    if (!value) return "";
    const text = String(value).trim();
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : text;
    } catch {
      return text;
    }
  }
}
