import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OperLogController } from "./oper-log.controller";
import { OperLogService } from "./oper-log.service";
import { OperLogEntity } from "./entities/oper-log.entity";
import { MenuModule } from "../menu/menu.module";
import { OprationLogListener } from "../monitor/opration-log.listener";

@Module({
  imports: [MenuModule, TypeOrmModule.forFeature([OperLogEntity])],
  controllers: [OperLogController],
  providers: [OperLogService, OprationLogListener],
  exports: [OperLogService]
})
export class OperLogModule { }
