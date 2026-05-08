import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleEntity } from "./entities/role.entity";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { MenuModule } from "../menu/menu.module";

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity]), forwardRef(() => MenuModule)],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})

export class RoleModule { }