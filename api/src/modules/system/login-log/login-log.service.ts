import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseService } from "@/common/services/base.service";
import { NestSystemLoginLogEntity } from "./entities/login-log.entity";

@Injectable()
export class NestSystemLoginLogService extends BaseService<NestSystemLoginLogEntity> {
  constructor(
    @InjectRepository(NestSystemLoginLogEntity)
    private readonly nestSystemLoginLogRepository: Repository<NestSystemLoginLogEntity>,
  ) {
    super(nestSystemLoginLogRepository);
  }
}
