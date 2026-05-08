import { Module } from "@nestjs/common";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";
import { ConfigModule } from "../config/config.module";
import { AttachmentModule } from "../attachment/attachment.module";

@Module({
  imports: [ConfigModule, AttachmentModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
