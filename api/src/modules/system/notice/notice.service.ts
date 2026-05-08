import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseService } from "@/common/services/base.service";
import { NoticeEntity } from "./entities/notice.entity";

@Injectable()
export class NoticeService extends BaseService<NoticeEntity> {
  constructor(
    @InjectRepository(NoticeEntity)
    private readonly noticeRepository: Repository<NoticeEntity>,
  ) {
    super(noticeRepository);
  }
}
