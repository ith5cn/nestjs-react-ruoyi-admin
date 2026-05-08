import { Injectable } from "@nestjs/common";
import { BaseService } from "@/common/services/base.service";
import { CrontabEntity } from "../entities/crontab.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()

export class CrontabService extends BaseService<CrontabEntity> {
    constructor(
        @InjectRepository(CrontabEntity)
        private readonly crontabRepository: Repository<CrontabEntity>,
    ) {
        super(crontabRepository);
    }
}