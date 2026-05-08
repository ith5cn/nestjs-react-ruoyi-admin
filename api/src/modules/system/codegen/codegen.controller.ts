import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import type { ImportCodegenTablesDto } from "./dto/import-codegen-tables.dto";
import { CodegenService } from "./codegen.service";

@Controller('system/codegen')
export class CodegenController {

    constructor(private readonly codegenService: CodegenService) { }


    @Get('index')
    async index(@Query() query: any) {
        const where = this.codegenService.buildWhere(query, {
            equals: ['source','table_name']
        });
        const order: any = { id: 'ASC' };
        const data = await this.codegenService.getAll({ where, order });
        return data;
    }



    /**
     * 删除已经载入的数据表
     */
    @Post('delete')
    async delete(@Body() dto: any) {
        return await this.codegenService.removeTables(dto.ids)
    }


    /**
     * 导入表
     * @param dto 
     * @returns 
     */
    @Post('importTables')
    importTables(@Body() dto: ImportCodegenTablesDto) {
        return this.codegenService.importTables(dto);
    }

    @Get('detail/:id')
    detail(@Param('id') id: string) {
        return this.codegenService.getDetail(Number(id));
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any) {
        return this.codegenService.updateConfig(Number(id), dto);
    }

    @Post('generate/:id')
    generate(@Param('id') id: string) {
        return this.codegenService.generate(Number(id));
    }

    @Get('preview/:id')
    preview(@Param('id') id: string) {
        return this.codegenService.preview(Number(id));
    }

    /**
     * 获取数据库连接配置
     * @returns 
     */
    @Get('datasources')
    datasources() {
        return this.codegenService.getDatasourceOptions();
    }

    /**
     * 获取数据库表
     * @param source 
     * @param keyword 
     * @returns 
     */
    @Get('db-tables')
    dbTables(@Query('source') source: string, @Query('keyword') keyword?: string) {
        return this.codegenService.getImportableTables(source, keyword);
    }


}
