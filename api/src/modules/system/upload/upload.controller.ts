import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("system/uploadImage")
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body("dirname") dirname?: string) {
    return this.uploadService.uploadImage(file, dirname);
  }

  @Post("system/uploadFile")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body("dirname") dirname?: string) {
    return this.uploadService.uploadFile(file, dirname);
  }

  @Post("system/upload/editor-image")
  @UseInterceptors(FileInterceptor("file"))
  async uploadEditorImage(@UploadedFile() file: Express.Multer.File, @Body("dirname") dirname?: string) {
    return this.uploadService.uploadEditorImage(file, dirname);
  }
}
