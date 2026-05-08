import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { RoleModule } from "../role/role.module";
import { MenuModule } from "../menu/menu.module";
import { DeptModule } from "../dept/dept.module";
import { PostModule } from "../post/post.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        forwardRef(() => RoleModule),
        forwardRef(() => MenuModule),
        forwardRef(() => PostModule),
        DeptModule
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [TypeOrmModule, UserService],
})
export class UserModule { }