import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NestSystemLoginLogController } from "./login-log.controller";
import { NestSystemLoginLogService } from "./login-log.service";
import { NestSystemLoginLogEntity } from "./entities/login-log.entity";
import { LoginLogListener } from "../monitor/login-log.listener";

@Module({
  imports: [TypeOrmModule.forFeature([NestSystemLoginLogEntity])],
  controllers: [NestSystemLoginLogController],
  providers: [NestSystemLoginLogService, LoginLogListener],
  exports: [NestSystemLoginLogService]
})
export class NestSystemLoginLogModule { }
