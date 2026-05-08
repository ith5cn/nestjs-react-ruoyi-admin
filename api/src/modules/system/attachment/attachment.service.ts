import { createHash } from "crypto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from "typeorm";
import { promises as fs } from "fs";
import { join } from "path";
import COS = require("cos-nodejs-sdk-v5");
import { ApiException } from "@/common/exceptions/api.exception";
import { BaseService } from "@/common/services/base.service";
import { ConfigService } from "../config/service/config.service";
import { AttachmentEntity } from "./entities/attachment.entity";

type AttachmentResourceType = "all" | "image" | "document" | "audio" | "video" | "application";

interface SaveAttachmentRecordInput {
  storageMode: number;
  originName: string;
  objectName: string;
  mimeType: string;
  storagePath: string;
  suffix: string;
  sizeByte: number;
  url: string;
  hash?: string;
  remark?: string | null;
}

interface RemoveAttachmentInput {
  ids: Array<number | string>;
  removeSource?: boolean;
}

@Injectable()
export class AttachmentService extends BaseService<AttachmentEntity> {
  private readonly documentMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  private readonly localUploadRoot = join(process.cwd(), "runtime", "uploads");

  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    private readonly configService: ConfigService,
  ) {
    super(attachmentRepository);
  }

  async getAttachmentList(query: any) {
    const pageNum = Number(query.page || 1);
    const pageSize = Number(query.size || query.limit || 10);
    const where: any = {};

    if (query.origin_name) {
      where.originName = Like(`%${String(query.origin_name).trim()}%`);
    }
    if (query.storage_mode) {
      where.storageMode = Number(query.storage_mode);
    }

    const startDate = this.normalizeDate(query.start_date, false);
    const endDate = this.normalizeDate(query.end_date, true);
    if (startDate && endDate) {
      where.createTime = Between(startDate, endDate);
    } else if (startDate) {
      where.createTime = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createTime = LessThanOrEqual(endDate);
    }

    const resourceType = this.normalizeResourceType(query.resource_type);
    const order = { id: "DESC" } as const;

    if (resourceType === "all") {
      const result = await this.getList(pageNum, pageSize, { where, order });
      return {
        ...result,
        data: result.data.map((item) => ({
          ...item,
          resourceType: this.getResourceType(item.mimeType),
        })),
      };
    }

    const rows = await this.getAll({ where, order });
    const filteredRows = rows.filter((item) => this.getResourceType(item.mimeType) === resourceType);
    const startIndex = (pageNum - 1) * pageSize;
    const pageRows = filteredRows.slice(startIndex, startIndex + pageSize);

    return {
      data: pageRows.map((item) => ({
        ...item,
        resourceType: this.getResourceType(item.mimeType),
      })),
      total: filteredRows.length,
    };
  }

  async saveUploadRecord(input: SaveAttachmentRecordInput) {
    const hash = String(input.hash || "").trim();
    if (hash) {
      const existed = await this.attachmentRepository.findOne({
        where: { hash },
        order: { id: "DESC" },
      });
      if (existed) {
        return existed;
      }
    }

    const entity = this.attachmentRepository.create({
      storageMode: input.storageMode,
      originName: input.originName,
      objectName: input.objectName,
      hash,
      mimeType: input.mimeType,
      storagePath: input.storagePath,
      suffix: input.suffix,
      sizeByte: String(input.sizeByte),
      sizeInfo: this.formatFileSize(input.sizeByte),
      url: input.url,
      remark: input.remark || undefined,
    } as Partial<AttachmentEntity>) as AttachmentEntity;

    return this.attachmentRepository.save(entity);
  }

  async removeBatch(input: RemoveAttachmentInput) {
    const idList = Array.isArray(input?.ids)
      ? input.ids
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item) && item > 0)
      : [];

    if (idList.length === 0) {
      throw new ApiException("附件ID不能为空");
    }

    const removeSource = input?.removeSource === true;

    await this.attachmentRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(AttachmentEntity);
      const rows = await repository.find({
        where: {
          id: In(idList),
        } as any,
        order: { id: "DESC" },
      });

      if (rows.length !== idList.length) {
        throw new ApiException("部分附件不存在或已删除");
      }

      if (removeSource) {
        for (const item of rows) {
          await this.removeSourceFile(item);
        }
      }

      await repository.softDelete(idList);
    });

    return true;
  }

  buildFileHash(buffer: Buffer) {
    return createHash("sha1").update(buffer).digest("hex");
  }

  getResourceType(mimeType?: string | null): Exclude<AttachmentResourceType, "all"> {
    const normalizedMimeType = String(mimeType || "").trim().toLowerCase();

    if (normalizedMimeType.startsWith("image/")) return "image";
    if (normalizedMimeType.startsWith("audio/")) return "audio";
    if (normalizedMimeType.startsWith("video/")) return "video";
    if (normalizedMimeType.startsWith("text/")) return "document";
    if (this.documentMimeTypes.includes(normalizedMimeType)) return "document";
    if (normalizedMimeType.startsWith("application/")) return "application";

    return "application";
  }

  private async removeSourceFile(item: AttachmentEntity) {
    if (item.storageMode === 1) {
      await this.removeLocalFile(item);
      return;
    }

    if (item.storageMode === 4) {
      await this.removeCosFile(item);
      return;
    }

    throw new ApiException(`附件 ${item.originName || item.id} 的存储方式暂未实现源文件删除`);
  }

  private async removeLocalFile(item: AttachmentEntity) {
    const storagePath = String(item.storagePath || "").trim().replace(/^\/+/, "");
    if (!storagePath) {
      throw new ApiException(`附件 ${item.originName || item.id} 缺少本地存储路径`);
    }

    const absolutePath = join(this.localUploadRoot, ...storagePath.split("/"));
    try {
      await fs.access(absolutePath);
    } catch {
      throw new ApiException(`附件 ${item.originName || item.id} 的本地源文件不存在`);
    }

    try {
      await fs.unlink(absolutePath);
    } catch {
      throw new ApiException(`附件 ${item.originName || item.id} 的本地源文件删除失败`);
    }
  }

  private async removeCosFile(item: AttachmentEntity) {
    const runtimeConfig = await this.getCosRuntimeConfig();
    const storagePath = String(item.storagePath || "").trim().replace(/^\/+/, "");
    if (!storagePath) {
      throw new ApiException(`附件 ${item.originName || item.id} 缺少 COS 存储路径`);
    }

    if (
      !runtimeConfig.secretId ||
      !runtimeConfig.secretKey ||
      !runtimeConfig.bucket ||
      !runtimeConfig.region
    ) {
      throw new ApiException("腾讯云 COS 配置不完整，无法删除源文件");
    }

    const client = new COS({
      SecretId: runtimeConfig.secretId,
      SecretKey: runtimeConfig.secretKey,
    });

    try {
      await client.deleteObject({
        Bucket: runtimeConfig.bucket,
        Region: runtimeConfig.region,
        Key: storagePath,
      });
    } catch {
      throw new ApiException(`附件 ${item.originName || item.id} 的 COS 源文件删除失败`);
    }
  }

  private async getCosRuntimeConfig() {
    const configMap = await this.configService.getConfigMapByGroupCode("upload_config");
    return {
      secretId: String(configMap.cos_secretId || "").trim(),
      secretKey: String(configMap.cos_secretKey || "").trim(),
      bucket: String(configMap.cos_bucket || "").trim(),
      region: String(configMap.cos_region || "").trim(),
    };
  }

  private normalizeResourceType(value?: string): AttachmentResourceType {
    const type = String(value || "all").trim().toLowerCase() as AttachmentResourceType;
    if (["all", "image", "document", "audio", "video", "application"].includes(type)) {
      return type;
    }
    return "all";
  }

  private normalizeDate(value?: string, endOfDay?: boolean) {
    const text = String(value || "").trim();
    if (!text) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return `${text} ${endOfDay ? "23:59:59" : "00:00:00"}`;
    }
    return text;
  }

  private formatFileSize(size: number) {
    if (size >= 1024 * 1024) {
      return `${Math.round((size / 1024 / 1024) * 100) / 100}MB`;
    }
    if (size >= 1024) {
      return `${Math.round((size / 1024) * 100) / 100}KB`;
    }
    return `${size}B`;
  }
}
