import { Module } from "@nestjs/common";
import { ConfigController } from "./controller/config.controller";
import { ConfigGroupController } from "./controller/config-group.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigEntity } from "./entities/config.entity";
import { ConfigGroupEntity } from "./entities/config-group.entity";
import { ConfigService } from "./service/config.service";
import { ConfigGroupService } from "./service/config-group.service";

@Module({
    imports: [TypeOrmModule.forFeature([ConfigEntity, ConfigGroupEntity])],
    controllers: [ConfigController, ConfigGroupController],
    providers: [ConfigService, ConfigGroupService],
    exports: [ConfigService, ConfigGroupService]
})
export class ConfigModule { }