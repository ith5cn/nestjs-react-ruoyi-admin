import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttachmentController } from "./attachment.controller";
import { AttachmentService } from "./attachment.service";
import { AttachmentEntity } from "./entities/attachment.entity";
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentEntity]), ConfigModule],
  controllers: [AttachmentController],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
