import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NoticeController } from "./notice.controller";
import { NoticeService } from "./notice.service";
import { NoticeEntity } from "./entities/notice.entity";

@Module({
  imports: [TypeOrmModule.forFeature([NoticeEntity])],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
