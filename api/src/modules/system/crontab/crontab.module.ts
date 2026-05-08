import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CrontabEntity } from "./entities/crontab.entity";
import { CrontabLogEntity } from "./entities/crontab-log.entity";
import { CrontabService } from "./services/crontab.service";
import CrontabController from "./crontab.controller";
import { DiscoveryModule } from "@nestjs/core";
import { HttpModule } from "@nestjs/axios";
import { CrontabRunnerService } from "./services/crontab-runner.service";
import { CrontabLogService } from "./services/crontab-log.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CrontabEntity, CrontabLogEntity]),
        DiscoveryModule,
        HttpModule,
    ],
    controllers: [CrontabController],
    providers: [
        CrontabService,
        CrontabLogService,
        CrontabRunnerService,
    ],
})
export class CrontabModule { }
