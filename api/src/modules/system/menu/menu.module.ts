import { Module, forwardRef } from "@nestjs/common";
import { MenuService } from "./menu.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MenuController } from "./menu.controller";
import { MenuEntity } from "./entities/menu.entity";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([MenuEntity]),
        forwardRef(() => UserModule)
    ],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService],
})
export class MenuModule { }