import { Module } from "@nestjs/common";
import { CodegenController } from "./codegen.controller";
import { CodegenService } from "./codegen.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ToolGenerateTablesEntity } from "./entities/gen-table.entity";
import { ToolGenerateColumnsEntity } from "./entities/gen-table-column.entity";
import { MenuModule } from "../menu/menu.module";

@Module({
    imports:[TypeOrmModule.forFeature([ToolGenerateTablesEntity, ToolGenerateColumnsEntity]), MenuModule],
    controllers: [CodegenController],
    providers: [CodegenService]
})

export  class CodegenModule { }
