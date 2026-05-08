import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { extname, join } from "path";
import COS = require("cos-nodejs-sdk-v5");
import { ApiException } from "@/common/exceptions/api.exception";
import { ConfigService } from "../config/service/config.service";
import { AttachmentService } from "../attachment/attachment.service";

export interface UploadImageResult {
  id?: number;
  path: string;
  url: string;
}

export interface UploadFileResult {
  id?: number;
  path: string;
  url: string;
  name: string;
}

enum UploadMode {
  LOCAL = "local",
  OSS = "oss",
  QINIU = "qiniu",
  COS = "cos",
  S3 = "s3",
}

interface UploadRuntimeConfig {
  mode: UploadMode;
  imageMimeTypes: string[];
  fileExtensions: string[];
  maxFileSize: number;
  local: {
    domain: string;
    dirname: string;
  };
  cos: {
    bucket: string;
    region: string;
    dirname: string;
    domain: string;
    secretId: string;
    secretKey: string;
  };
}

@Injectable()
export class UploadService {
  private readonly defaultImageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  private readonly defaultFileExtensions = ["*"];
  private readonly defaultMaxFileSize = 20 * 1024 * 1024;
  private readonly localUploadRoot = join(process.cwd(), "runtime", "uploads");

  constructor(
    private readonly systemConfigService: ConfigService,
    private readonly attachmentService: AttachmentService,
  ) {}

  async uploadImage(file?: Express.Multer.File, customDirname?: string): Promise<UploadImageResult> {
    const runtimeConfig = await this.getUploadRuntimeConfig();
    const uploadFile = this.requireFile(file, "请上传图片文件");
    const originalName = this.normalizeOriginalName(uploadFile.originalname);

    this.assertFileContent(uploadFile);
    if (!this.matchImageType(uploadFile.mimetype, runtimeConfig.imageMimeTypes)) {
      throw new ApiException(`仅支持 ${runtimeConfig.imageMimeTypes.join("、")} 图片`);
    }
    this.assertFileSize(uploadFile.size, runtimeConfig.maxFileSize, "图片");

    return this.uploadByMode(runtimeConfig, uploadFile, customDirname, "image", originalName);
  }

  async uploadEditorImage(file?: Express.Multer.File, customDirname?: string): Promise<UploadImageResult> {
    return this.uploadImage(file, customDirname);
  }

  async uploadFile(file?: Express.Multer.File, customDirname?: string): Promise<UploadFileResult> {
    const runtimeConfig = await this.getUploadRuntimeConfig();
    const uploadFile = this.requireFile(file, "请上传文件");
    const originalName = this.normalizeOriginalName(uploadFile.originalname);

    this.assertFileContent(uploadFile);
    this.assertFileSize(uploadFile.size, runtimeConfig.maxFileSize, "文件");
    if (!this.matchFileType(originalName, runtimeConfig.fileExtensions)) {
      throw new ApiException(`文件类型不允许上传，允许类型：${runtimeConfig.fileExtensions.join("、")}`);
    }

    const result = await this.uploadByMode(runtimeConfig, uploadFile, customDirname, "file", originalName);
    return {
      ...result,
      name: originalName || result.path.split("/").pop() || "file",
    };
  }

  private async uploadByMode(
    runtimeConfig: UploadRuntimeConfig,
    file: Express.Multer.File,
    customDirname: string | undefined,
    category: "image" | "file",
    originalName: string,
  ): Promise<UploadImageResult> {
    const dirname = this.resolveDirname(runtimeConfig, customDirname);
    const objectPath = this.buildObjectPath(dirname, originalName, category);
    let uploaded: UploadImageResult;

    switch (runtimeConfig.mode) {
      case UploadMode.LOCAL:
        uploaded = await this.uploadToLocal(runtimeConfig, file, objectPath);
        break;
      case UploadMode.COS:
        uploaded = await this.uploadToCos(runtimeConfig, file, objectPath);
        break;
      case UploadMode.OSS:
      case UploadMode.QINIU:
      case UploadMode.S3:
        throw new ApiException("当前存储方式未实现");
      default:
        throw new ApiException("上传配置不完整");
    }

    const attachment = await this.attachmentService.saveUploadRecord({
      storageMode: this.getStorageModeCode(runtimeConfig.mode),
      originName: originalName || objectPath.split("/").pop() || category,
      objectName: objectPath.split("/").pop() || category,
      hash: this.attachmentService.buildFileHash(file.buffer),
      mimeType: file.mimetype || "application/octet-stream",
      storagePath: uploaded.path,
      suffix: extname(originalName || "").replace(/^\./, "").toLowerCase(),
      sizeByte: file.size,
      url: uploaded.url,
    });

    return {
      ...uploaded,
      id: attachment.id,
    };
  }

  private async uploadToLocal(
    runtimeConfig: UploadRuntimeConfig,
    file: Express.Multer.File,
    objectPath: string,
  ): Promise<UploadImageResult> {
    this.assertLocalConfig(runtimeConfig);

    const absolutePath = join(this.localUploadRoot, ...objectPath.split("/"));
    await fs.mkdir(join(absolutePath, ".."), { recursive: true });
    await fs.writeFile(absolutePath, file.buffer);

    return {
      path: objectPath,
      url: this.buildFileUrl(runtimeConfig.local.domain, objectPath),
    };
  }

  private async uploadToCos(
    runtimeConfig: UploadRuntimeConfig,
    file: Express.Multer.File,
    objectPath: string,
  ): Promise<UploadImageResult> {
    this.assertCosConfig(runtimeConfig);

    await this.createCosClient(runtimeConfig).putObject({
      Bucket: runtimeConfig.cos.bucket,
      Region: runtimeConfig.cos.region,
      Key: objectPath,
      Body: file.buffer,
      ContentType: file.mimetype || "application/octet-stream",
    });

    return {
      path: objectPath,
      url: this.buildFileUrl(runtimeConfig.cos.domain, objectPath),
    };
  }

  private async getUploadRuntimeConfig(): Promise<UploadRuntimeConfig> {
    const configMap = await this.systemConfigService.getConfigMapByGroupCode("upload_config");

    return {
      mode: this.normalizeUploadMode(configMap.upload_mode),
      imageMimeTypes: this.normalizeImageMimeTypes(configMap.image_type),
      fileExtensions: this.normalizeFileExtensions(configMap.file_type),
      maxFileSize: this.normalizeMaxFileSize(configMap.upload_size),
      local: {
        domain: String(configMap.local_domain || "").trim(),
        dirname: this.normalizeDirname(configMap.local_dirname),
      },
      cos: {
        secretId: String(configMap.cos_secretId || "").trim(),
        secretKey: String(configMap.cos_secretKey || "").trim(),
        bucket: String(configMap.cos_bucket || "").trim(),
        dirname: this.normalizeDirname(configMap.cos_dirname),
        domain: String(configMap.cos_domain || "").trim(),
        region: String(configMap.cos_region || "").trim(),
      },
    };
  }

  private createCosClient(runtimeConfig: UploadRuntimeConfig) {
    return new COS({
      SecretId: runtimeConfig.cos.secretId,
      SecretKey: runtimeConfig.cos.secretKey,
    });
  }

  private assertLocalConfig(runtimeConfig: UploadRuntimeConfig) {
    if (!runtimeConfig.local.domain || !runtimeConfig.local.dirname) {
      throw new ApiException("本地上传配置不完整");
    }
  }

  private assertCosConfig(runtimeConfig: UploadRuntimeConfig) {
    if (
      !runtimeConfig.cos.secretId ||
      !runtimeConfig.cos.secretKey ||
      !runtimeConfig.cos.bucket ||
      !runtimeConfig.cos.region ||
      !runtimeConfig.cos.domain ||
      !runtimeConfig.cos.dirname
    ) {
      throw new ApiException("腾讯云 COS 配置不完整");
    }
  }

  private requireFile(file: Express.Multer.File | undefined, message: string): Express.Multer.File {
    if (!file) {
      throw new ApiException(message);
    }
    return file;
  }

  private assertFileContent(file: Express.Multer.File) {
    if (!file.buffer?.length) {
      throw new ApiException("上传文件内容不能为空");
    }
  }

  private assertFileSize(size: number, maxSize: number, label: string) {
    if (size > maxSize) {
      throw new ApiException(`${label}大小不能超过 ${this.formatFileSize(maxSize)}`);
    }
  }

  private normalizeUploadMode(value?: string) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (text === "1" || text === UploadMode.LOCAL) return UploadMode.LOCAL;
    if (text === "2" || text === UploadMode.OSS) return UploadMode.OSS;
    if (text === "3" || text === UploadMode.QINIU) return UploadMode.QINIU;
    if (text === "4" || text === UploadMode.COS) return UploadMode.COS;
    if (text === "5" || text === UploadMode.S3) return UploadMode.S3;

    throw new ApiException("上传模式配置无效");
  }

  private getStorageModeCode(mode: UploadMode) {
    switch (mode) {
      case UploadMode.LOCAL:
        return 1;
      case UploadMode.OSS:
        return 2;
      case UploadMode.QINIU:
        return 3;
      case UploadMode.COS:
        return 4;
      case UploadMode.S3:
        return 5;
      default:
        return 0;
    }
  }

  private normalizeImageMimeTypes(value?: string) {
    const items = this.splitConfigValue(value).map((item) => item.toLowerCase());
    if (items.length === 0) return this.defaultImageMimeTypes;

    return items.map((item) => {
      if (item === "*" || item === "*.*") return item;
      if (item.startsWith(".")) {
        return this.extensionToMimeType(item) || item;
      }
      return item;
    });
  }

  private normalizeFileExtensions(value?: string) {
    const items = this.splitConfigValue(value).map((item) => item.toLowerCase());
    if (items.length === 0) return this.defaultFileExtensions;

    return items.map((item) => {
      if (item === "*" || item === "*.*") return "*";
      if (item.startsWith(".")) return item;
      if (item.includes("/")) {
        const ext = this.mimeTypeToExtension(item);
        return ext || item;
      }
      return `.${item.replace(/^\.+/, "")}`;
    });
  }

  private normalizeMaxFileSize(value?: string) {
    const text = String(value || "").trim();
    if (!text) return this.defaultMaxFileSize;

    const numeric = Number(text);
    if (!Number.isFinite(numeric) || numeric <= 0) return this.defaultMaxFileSize;

    return numeric < 1024 ? numeric * 1024 * 1024 : numeric;
  }

  private normalizeDirname(value?: string) {
    const text = String(value || "")
      .trim()
      .replace(/^\/+|\/+$/g, "");
    return text || "upload";
  }

  private normalizeOriginalName(originalName?: string) {
    const text = String(originalName || "").trim();
    if (!text) return "";

    try {
      const decoded = Buffer.from(text, "latin1").toString("utf8").trim();
      if (!decoded) return text;
      if (decoded.includes("�") && !text.includes("�")) {
        return text;
      }
      return decoded;
    } catch {
      return text;
    }
  }

  private splitConfigValue(value?: string) {
    return String(value || "")
      .split(/[,\n\r|;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private matchImageType(mimeType: string, allowedMimeTypes: string[]) {
    if (allowedMimeTypes.includes("*") || allowedMimeTypes.includes("*.*")) return true;
    const target = String(mimeType || "").toLowerCase();
    return allowedMimeTypes.some((item) => item === target);
  }

  private matchFileType(originalName: string, allowedExtensions: string[]) {
    if (allowedExtensions.includes("*")) return true;
    const extension = extname(originalName || "").toLowerCase();
    return allowedExtensions.includes(extension);
  }

  private resolveDirname(runtimeConfig: UploadRuntimeConfig, customDirname?: string) {
    const preferred = this.normalizeDirname(customDirname);
    if (customDirname && preferred) return preferred;

    if (runtimeConfig.mode === UploadMode.LOCAL) {
      return runtimeConfig.local.dirname;
    }
    if (runtimeConfig.mode === UploadMode.COS) {
      return runtimeConfig.cos.dirname;
    }
    return preferred;
  }

  private buildObjectPath(dirname: string, originalName: string | undefined, category: "image" | "file") {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const suffix = extname(originalName || "").toLowerCase() || (category === "image" ? ".png" : "");
    const baseName = (originalName || category)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const safeName = baseName || category;
    return `${dirname}/${year}/${month}/${safeName}-${randomUUID().replace(/-/g, "")}${suffix}`;
  }

  private buildFileUrl(domain: string, path: string) {
    const base = String(domain || "").trim().replace(/\/+$/, "");
    const cleanPath = String(path || "").trim().replace(/^\/+/, "");
    return base ? `${base}/${cleanPath}` : cleanPath;
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

  private extensionToMimeType(extension: string) {
    const map: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
    };
    return map[extension];
  }

  private mimeTypeToExtension(mimeType: string) {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/bmp": ".bmp",
      "image/svg+xml": ".svg",
      "application/pdf": ".pdf",
      "application/zip": ".zip",
      "application/x-zip-compressed": ".zip",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
      "text/plain": ".txt",
    };
    return map[mimeType];
  }
}
