import { Injectable } from "@nestjs/common";
import { BaseService } from "@/common/services/base.service";
import { CrontabLogEntity } from "../entities/crontab-log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class CrontabLogService extends BaseService<CrontabLogEntity> {
    constructor(
        @InjectRepository(CrontabLogEntity)
        private readonly crontabLogRepository: Repository<CrontabLogEntity>,
    ) {
        super(crontabLogRepository);
    }
}
