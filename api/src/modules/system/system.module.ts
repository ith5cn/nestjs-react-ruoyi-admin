import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "./user/user.module";
import { MenuModule } from "./menu/menu.module";
import { RoleModule } from "./role/role.module";
import { DeptModule } from "./dept/dept.module";
import { DictModule } from "./dict/dict.module";
import { PostModule } from "./post/post.module";
import { NoticeModule } from "./notice/notice.module";
import { CrontabModule } from "./crontab/crontab.module";
import { CodegenModule } from "./codegen/codegen.module";
import { RegionModule } from "./region/region.module";
import { UploadModule } from "./upload/upload.module";
import { ConfigModule } from "./config/config.module";
import { AttachmentModule } from "./attachment/attachment.module";

import { NestSystemLoginLogModule } from "./login-log/login-log.module";
import { OperLogModule } from "./oper-log/oper-log.module";
@Module({
    imports: [AuthModule, UserModule, MenuModule, RoleModule, DeptModule, DictModule, PostModule, NoticeModule, CrontabModule, CodegenModule, RegionModule, UploadModule, ConfigModule, AttachmentModule, NestSystemLoginLogModule, OperLogModule]
})
export class SystemModule { }
