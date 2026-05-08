import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { promises as fs } from "fs";
import * as path from "path";
import { BaseService } from "@/common/services/base.service";
import { ApiException } from "@/common/exceptions/api.exception";
import {
  ImportCodegenTableItemDto,
  ImportCodegenTablesDto,
} from "./dto/import-codegen-tables.dto";
import { ToolGenerateTablesEntity } from "./entities/gen-table.entity";
import { ToolGenerateColumnsEntity } from "./entities/gen-table-column.entity";
import { MenuService } from "../menu/menu.service";

interface TableMetaRow {
  TABLE_NAME: string;
  TABLE_COMMENT: string | null;
}

interface ColumnMetaRow {
  COLUMN_NAME: string;
  COLUMN_COMMENT: string | null;
  COLUMN_TYPE: string | null;
  COLUMN_DEFAULT: string | null;
  IS_NULLABLE: string;
  COLUMN_KEY: string | null;
  ORDINAL_POSITION: number;
  DATA_TYPE: string | null;
}

export interface ImportTableResult {
  tableName: string;
  action: "created" | "updated";
  tableId: number;
  columnCount: number;
}

export interface CodegenDetailResult {
  table: ToolGenerateTablesEntity;
  columns: ToolGenerateColumnsEntity[];
}

interface CodegenUpdatePayload {
  table?: Partial<ToolGenerateTablesEntity>;
  columns?: Array<Partial<ToolGenerateColumnsEntity>>;
}

export interface GenerateResult {
  generated: boolean;
  backendFiles: string[];
  frontendFiles: string[];
  menuIds: number[];
}

export interface PreviewFileResult {
  path: string;
  content: string;
  group: "backend" | "frontend";
}

export interface PreviewResult {
  files: PreviewFileResult[];
}

interface GenerateContext {
  table: ToolGenerateTablesEntity;
  columns: ToolGenerateColumnsEntity[];
  packageName: string;
  businessName: string;
  businessApiName: string;
  dataSourceName: string;
  className: string;
  entityName: string;
  entityVarName: string;
  routePath: string;
  pageComponentPath: string;
  backendModuleDir: string;
  frontendPageDir: string;
  queryColumns: ToolGenerateColumnsEntity[];
  listColumns: ToolGenerateColumnsEntity[];
  formColumns: ToolGenerateColumnsEntity[];
  editableColumns: ToolGenerateColumnsEntity[];
  entityBaseMode: "soft-delete" | "base" | "plain";
}

@Injectable()
export class CodegenService extends BaseService<ToolGenerateTablesEntity> {
  constructor(
    @InjectDataSource() private readonly nestSystemDataSource: DataSource,
    @InjectDataSource("db_center") private readonly dbCenterDataSource: DataSource,
    @InjectRepository(ToolGenerateTablesEntity)
    private readonly toolGenerateTablesRepository: Repository<ToolGenerateTablesEntity>,
    @InjectRepository(ToolGenerateColumnsEntity)
    private readonly toolGenerateColumnsRepository: Repository<ToolGenerateColumnsEntity>,
    private readonly menuService: MenuService,
  ) {
    super(toolGenerateTablesRepository);
  }

  async importTables(dto: ImportCodegenTablesDto): Promise<ImportTableResult[]> {
    const { source, tables } = dto;
    const dataSource = this.getDataSource(source);

    if (!dataSource) {
      throw new ApiException("数据源配置不存在");
    }

    if (!Array.isArray(tables) || tables.length === 0) {
      throw new ApiException("请选择要导入的数据表");
    }

    return this.toolGenerateTablesRepository.manager.transaction(async (manager) => {
      const tableRepository = manager.getRepository(ToolGenerateTablesEntity);
      const columnRepository = manager.getRepository(ToolGenerateColumnsEntity);
      const results: ImportTableResult[] = [];

      for (const item of tables) {
        results.push(
          await this.importSingleTable(dataSource, source, item, tableRepository, columnRepository),
        );
      }

      return results;
    });
  }

  async getDetail(id: number): Promise<CodegenDetailResult> {
    const table = await this.toolGenerateTablesRepository.findOneBy({ id });
    if (!table) {
      throw new ApiException("生成配置不存在");
    }

    const columns = await this.toolGenerateColumnsRepository.find({
      where: { table_id: id },
      order: { sort: "ASC", id: "ASC" },
    });

    return { table, columns };
  }

  async updateConfig(id: number, payload: CodegenUpdatePayload): Promise<CodegenDetailResult> {
    const detail = await this.getDetail(id);

    return this.toolGenerateTablesRepository.manager.transaction(async (manager) => {
      const tableRepository = manager.getRepository(ToolGenerateTablesEntity);
      const columnRepository = manager.getRepository(ToolGenerateColumnsEntity);
      const nextTable = this.normalizeTablePayload(payload.table, detail.table);
      this.validateRequiredTableFields(nextTable);

      await tableRepository.update(id, nextTable);
      await columnRepository.delete({ table_id: id });

      const nextColumns = Array.isArray(payload.columns) ? payload.columns : detail.columns;
      if (nextColumns.length > 0) {
        const rows = nextColumns.map((column, index) =>
          columnRepository.create(this.normalizeColumnPayload(id, column, index)),
        );
        await columnRepository.save(rows);
      }

      const table = (await tableRepository.findOneBy({ id })) as ToolGenerateTablesEntity;
      const columns = await columnRepository.find({
        where: { table_id: id },
        order: { sort: "ASC", id: "ASC" },
      });

      return { table, columns };
    });
  }

  async generate(id: number): Promise<GenerateResult> {
    const detail = await this.getDetail(id);
    this.validateRequiredTableFields(detail.table);
    const context = this.buildGenerateContext(detail.table, detail.columns);

    if (!context.businessName) {
      throw new ApiException("请先补全业务名称");
    }

    const backendFiles = await this.generateBackendFiles(context);
    const frontendFiles = await this.generateFrontendFiles(context);
    const menuIds = await this.syncMenus(context);

    return {
      generated: true,
      backendFiles,
      frontendFiles,
      menuIds,
    };
  }

  async preview(id: number): Promise<PreviewResult> {
    const detail = await this.getDetail(id);
    const context = this.buildGenerateContext(detail.table, detail.columns);
    const backendFiles = this.buildBackendPreviewFiles(context);
    const frontendFiles = this.buildFrontendPreviewFiles(context);

    return {
      files: [...backendFiles, ...frontendFiles],
    };
  }

  getDatasourceOptions() {
    return [
      this.buildDatasourceOption(this.nestSystemDataSource, "nest_system"),
      this.buildDatasourceOption(this.dbCenterDataSource, "db_center"),
    ];
  }

  async removeTables(ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiException("请选择要删除的数据表");
    }

    await this.toolGenerateTablesRepository.manager.transaction(async (manager) => {
      await manager.getRepository(ToolGenerateColumnsEntity).delete({ table_id: In(ids) });
      await manager.getRepository(ToolGenerateTablesEntity).delete(ids);
    });
  }

  async removeSubTables(tableIds: number[]) {
    if (!tableIds || tableIds.length === 0) return;
    await this.toolGenerateColumnsRepository.delete({ table_id: In(tableIds) });
  }

  async getImportableTables(source: string, keyword?: string) {
    const dataSource = this.getDataSource(source);
    if (!dataSource) {
      throw new ApiException("数据源配置不存在");
    }

    const databaseName = this.getDatabaseName(dataSource);
    const tables = await dataSource.query(
      `SELECT TABLE_NAME, TABLE_COMMENT, ENGINE, TABLE_COLLATION, CREATE_TIME
       FROM information_schema.tables
       WHERE table_schema = ?
         AND table_type = 'BASE TABLE'`,
      [databaseName],
    );

    return tables.filter((item: TableMetaRow) => {
      if (!keyword) return true;
      return [item.TABLE_NAME, item.TABLE_COMMENT]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword.toLowerCase()));
    });
  }

  private async importSingleTable(
    dataSource: DataSource,
    source: string,
    item: ImportCodegenTableItemDto,
    tableRepository: Repository<ToolGenerateTablesEntity>,
    columnRepository: Repository<ToolGenerateColumnsEntity>,
  ): Promise<ImportTableResult> {
    const tableName = item.tableName?.trim();
    if (!tableName) {
      throw new ApiException("存在未填写表名的数据表");
    }

    const tableMeta = await this.getTableMetadata(dataSource, tableName);
    if (!tableMeta) {
      throw new ApiException(`数据表 ${tableName} 不存在`);
    }

    const columns = await this.getTableColumns(dataSource, tableName);
    if (columns.length === 0) {
      throw new ApiException(`数据表 ${tableName} 未查询到字段信息`);
    }

    const existing = await tableRepository.findOne({
      where: { source, table_name: tableName },
    });

    const tableComment = tableMeta.TABLE_COMMENT ?? item.tableComment ?? undefined;
    let tableEntity: ToolGenerateTablesEntity;
    let action: "created" | "updated";

    if (existing) {
      action = "updated";
      await tableRepository.update(existing.id, {
        source,
        table_name: tableMeta.TABLE_NAME,
        table_comment: tableComment,
        package_name: existing.package_name || "system",
        business_name: existing.business_name || this.toKebabCase(tableMeta.TABLE_NAME),
        class_name: existing.class_name || this.toPascalCase(tableMeta.TABLE_NAME),
        menu_name: existing.menu_name || tableMeta.TABLE_COMMENT || this.toPascalCase(tableMeta.TABLE_NAME),
      });
      tableEntity = (await tableRepository.findOneBy({ id: existing.id })) as ToolGenerateTablesEntity;
    } else {
      action = "created";
      tableEntity = await tableRepository.save(
        tableRepository.create({
          source,
          table_name: tableMeta.TABLE_NAME,
          table_comment: tableComment,
          package_name: "system",
          business_name: this.toKebabCase(tableMeta.TABLE_NAME),
          class_name: this.toPascalCase(tableMeta.TABLE_NAME),
          menu_name: tableMeta.TABLE_COMMENT ?? this.toPascalCase(tableMeta.TABLE_NAME),
        }),
      );
    }

    await columnRepository.delete({ table_id: tableEntity.id });
    const columnEntities = columns.map((column) =>
      columnRepository.create(this.mapColumnEntity(tableEntity.id, column)),
    );
    await columnRepository.save(columnEntities);

    return {
      tableName: tableEntity.table_name,
      action,
      tableId: tableEntity.id,
      columnCount: columnEntities.length,
    };
  }

  private async getTableMetadata(dataSource: DataSource, tableName: string): Promise<TableMetaRow | null> {
    const databaseName = this.getDatabaseName(dataSource);
    const rows = await dataSource.query(
      `SELECT TABLE_NAME, TABLE_COMMENT
       FROM information_schema.tables
       WHERE table_schema = ?
         AND table_name = ?
         AND table_type = 'BASE TABLE'
       LIMIT 1`,
      [databaseName, tableName],
    );

    return rows[0] ?? null;
  }

  private async getTableColumns(dataSource: DataSource, tableName: string): Promise<ColumnMetaRow[]> {
    const databaseName = this.getDatabaseName(dataSource);
    return dataSource.query(
      `SELECT COLUMN_NAME, COLUMN_COMMENT, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE, COLUMN_KEY, ORDINAL_POSITION, DATA_TYPE
       FROM information_schema.columns
       WHERE table_schema = ?
         AND table_name = ?
       ORDER BY ORDINAL_POSITION ASC`,
      [databaseName, tableName],
    );
  }

  private mapColumnEntity(tableId: number, column: ColumnMetaRow): Partial<ToolGenerateColumnsEntity> {
    const isPrimaryKey = column.COLUMN_KEY === "PRI";
    const isRequired = column.IS_NULLABLE === "NO";
    const columnName = String(column.COLUMN_NAME).toLowerCase();

    return {
      table_id: tableId,
      column_name: column.COLUMN_NAME,
      column_comment: column.COLUMN_COMMENT ?? undefined,
      column_type: column.COLUMN_TYPE ?? undefined,
      default_value: column.COLUMN_DEFAULT ?? undefined,
      is_pk: isPrimaryKey ? 2 : 1,
      is_required: isRequired ? 2 : 1,
      is_insert: this.isSystemColumn(columnName) ? 1 : 2,
      is_edit: isPrimaryKey || this.isSystemColumn(columnName) ? 1 : 2,
      is_list: ["name", "title", "code", "status", "sort"].includes(columnName) ? 2 : 1,
      is_query: ["name", "title", "code", "status"].includes(columnName) ? 2 : 1,
      is_sort: columnName === "sort" ? 2 : 1,
      query_type: this.inferQueryType(column),
      view_type: this.inferViewType(column),
      dict_type: undefined,
      allow_roles: undefined,
      sort: Number(column.ORDINAL_POSITION) || 0,
      remark: undefined,
    };
  }

  private normalizeTablePayload(
    input: Partial<ToolGenerateTablesEntity> | undefined,
    current: ToolGenerateTablesEntity,
  ): Partial<ToolGenerateTablesEntity> {
    const next = input ?? {};
    return {
      table_comment: next.table_comment ?? current.table_comment,
      package_name: next.package_name ?? current.package_name,
      business_name: next.business_name ?? current.business_name,
      class_name: next.class_name ?? current.class_name,
      menu_name: next.menu_name ?? current.menu_name,
      belong_menu_id: next.belong_menu_id ?? current.belong_menu_id,
      generate_path: next.generate_path ?? current.generate_path,
      generate_model: next.generate_model ?? current.generate_model,
      component_type: next.component_type ?? current.component_type,
      sort: next.sort ?? current.sort,
      form_width: next.form_width ?? current.form_width,
      is_full: next.is_full ?? current.is_full,
      remark: next.remark ?? current.remark,
    };
  }

  private validateRequiredTableFields(table: Partial<ToolGenerateTablesEntity>) {
    const requiredFields: Array<[keyof ToolGenerateTablesEntity, string]> = [
      ["table_comment", "表描述"],
      ["class_name", "实体类"],
      ["generate_path", "生成路径"],
      ["package_name", "包名"],
      ["menu_name", "菜单名称"],
    ];

    for (const [field, label] of requiredFields) {
      const value = table[field];
      if (!String(value ?? "").trim()) {
        throw new ApiException(`请先填写${label}`);
      }
    }
  }

  private normalizeColumnPayload(
    tableId: number,
    input: Partial<ToolGenerateColumnsEntity>,
    index: number,
  ): Partial<ToolGenerateColumnsEntity> {
    const viewType = input.view_type ?? "input";
    const isDictSelect = viewType === "saSelect";

    return {
      table_id: tableId,
      column_name: input.column_name ?? "",
      column_comment: input.column_comment ?? undefined,
      column_type: input.column_type ?? undefined,
      default_value: input.default_value ?? undefined,
      is_pk: input.is_pk ?? 1,
      is_required: input.is_required ?? 1,
      is_insert: input.is_insert ?? 2,
      is_edit: input.is_edit ?? 2,
      is_list: input.is_list ?? 1,
      is_query: input.is_query ?? 1,
      is_sort: input.is_sort ?? 1,
      query_type: input.query_type ?? "eq",
      view_type: viewType,
      dict_type: isDictSelect ? input.dict_type ?? undefined : undefined,
      allow_roles: input.allow_roles ?? undefined,
      sort: input.sort ?? index + 1,
      remark: input.remark ?? undefined,
    };
  }

  private buildGenerateContext(table: ToolGenerateTablesEntity, columns: ToolGenerateColumnsEntity[]): GenerateContext {
    const packageName = this.toKebabCase(table.package_name || "system");
    const businessName = this.toKebabCase(table.business_name || table.table_name);
    const businessApiName = this.toCamelCase(businessName);
    const dataSourceName = table.source === "db_center" ? "db_center" : "";
    const className = this.toPascalCase(table.class_name || businessName);
    const entityName = className.replace(/Entity$/, "");

    return {
      table,
      columns,
      packageName,
      businessName,
      businessApiName,
      dataSourceName,
      className,
      entityName,
      entityVarName: this.toCamelCase(entityName),
      routePath: `${packageName}/${businessName}`,
      pageComponentPath: `${packageName}/${businessName}/index`,
      backendModuleDir: path.join("src", "modules", packageName, businessName),
      frontendPageDir: path.join("src", "pages", packageName, businessName),
      queryColumns: columns.filter(
        (column) =>
          column.is_query === 2 && !["wangEditor", "uploadImage", "uploadFile"].includes(column.view_type),
      ),
      listColumns: columns.filter((column) => column.is_list === 2),
      formColumns: columns.filter((column) => column.is_insert === 2 || column.is_edit === 2),
      editableColumns: columns.filter((column) => !this.isSystemColumn(column.column_name)),
      entityBaseMode: this.resolveEntityBaseMode(table, columns),
    };
  }

  private async generateBackendFiles(context: GenerateContext): Promise<string[]> {
    const adminApiRoot = process.cwd();
    const targetDir = path.join(adminApiRoot, context.backendModuleDir);
    const dtoDir = path.join(targetDir, "dto");
    const entityDir = path.join(targetDir, "entities");
    await fs.mkdir(dtoDir, { recursive: true });
    await fs.mkdir(entityDir, { recursive: true });
    const previewFiles = this.buildBackendPreviewFiles(context).map((item) => ({
      ...item,
      absolutePath: path.join(adminApiRoot, item.path),
    }));
    const files = previewFiles.map((item) => item.absolutePath);

    for (const file of previewFiles) {
      await fs.writeFile(file.absolutePath, file.content, "utf8");
    }

    await this.registerBackendModule(context, adminApiRoot, `${context.entityName}Module`);
    return files;
  }

  private async generateFrontendFiles(context: GenerateContext): Promise<string[]> {
    const generatePath = context.table.generate_path?.trim() || "sdm.ith5.com";
    const frontendRoot = this.resolveProjectRoot(generatePath);
    const pageDir = path.join(frontendRoot, context.frontendPageDir);
    const apiDir = path.join(frontendRoot, "src", "api", context.packageName);
    await fs.mkdir(pageDir, { recursive: true });
    await fs.mkdir(apiDir, { recursive: true });
    const previewFiles = this.buildFrontendPreviewFiles(context).map((item) => ({
      ...item,
      absolutePath: path.join(frontendRoot, item.path),
    }));
    const files = previewFiles.map((item) => item.absolutePath);

    for (const file of previewFiles) {
      await fs.writeFile(file.absolutePath, file.content, "utf8");
    }

    return files;
  }

  private buildBackendPreviewFiles(context: GenerateContext): PreviewFileResult[] {
    const moduleClass = `${context.entityName}Module`;
    const serviceClass = `${context.entityName}Service`;
    const controllerClass = `${context.entityName}Controller`;
    const dtoClass = `${context.entityName}Dto`;
    const entityClass = `${context.entityName}Entity`;
    const entityVar = context.entityVarName;
    const likes = context.queryColumns
      .filter((column) => column.query_type === "like")
      .map((column) => `'${this.toCamelCase(column.column_name)}'`)
      .join(", ");
    const equals = context.queryColumns
      .filter((column) => column.query_type !== "like")
      .map((column) => `'${this.toCamelCase(column.column_name)}'`)
      .join(", ");
    const dtoFields = context.editableColumns
      .map((column) => `  ${this.toCamelCase(column.column_name)}: ${this.renderZodField(column)},`)
      .join("\n");
    const dtoProps = context.editableColumns
      .map(
        (column) =>
          `  ${this.toCamelCase(column.column_name)}${column.is_required === 2 ? "" : "?"}: ${this.toDtoTypescriptType(column)};`,
      )
      .join("\n");
    const entityBaseImport =
      context.entityBaseMode === "soft-delete"
        ? 'import { SoftDeleteEntity } from "@/common/entities/soft-delete.entity";'
        : context.entityBaseMode === "base"
          ? 'import { BaseEntity } from "@/common/entities/base.entity";'
          : "";
    const entityBaseName =
      context.entityBaseMode === "soft-delete"
        ? "SoftDeleteEntity"
        : context.entityBaseMode === "base"
          ? "BaseEntity"
          : "";
    const entityColumnImport = context.entityBaseMode === "plain" ? "Column, Entity, PrimaryGeneratedColumn" : "Column, Entity";
    const entityPrimaryField = context.entityBaseMode === "plain" ? this.renderPrimaryColumn(context.columns) : "";
    const entityFields = context.columns
      .filter((column) => {
        const columnName = String(column.column_name).toLowerCase();
        if (columnName === "id") return false;
        if (context.entityBaseMode !== "plain" && this.isSystemColumn(column.column_name)) return false;
        if (context.entityBaseMode === "soft-delete" && columnName === "delete_time") return false;
        return true;
      })
      .map((column) => this.renderEntityColumn(column))
      .join("\n\n");
    const repositoryDataSourceArg = context.dataSourceName ? `, "${context.dataSourceName}"` : "";

    return [
      {
        path: path.join(context.backendModuleDir, `${context.businessName}.controller.ts`),
        group: "backend",
        content: `import { BaseController } from "@/common/controllers/base.controller";\nimport { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";\nimport { ${dtoClass} } from "./dto/${context.businessName}.dto";\nimport { ${entityClass} } from "./entities/${context.businessName}.entity";\nimport { ${serviceClass} } from "./${context.businessName}.service";\n\n@Controller("${context.routePath}")\nexport class ${controllerClass} extends BaseController<${entityClass}> {\n  constructor(private readonly ${entityVar}Service: ${serviceClass}) {\n    super(${entityVar}Service);\n  }\n\n  @Get("index")\n  async index(@Query() query: any) {\n    const { page = 1, limit = 10, size, ...options } = query;\n    const pageSize = Number(size || limit);\n    const pageNum = Number(page);\n    const where = this.${entityVar}Service.buildWhere(options, { likes: [${likes}], equals: [${equals}] });\n    const order: any = { id: "DESC" };\n    return await this.${entityVar}Service.getList(pageNum, pageSize, { where, order });\n  }\n\n  @Post()\n  async create(@Body() data: ${dtoClass}) {\n    return await this.${entityVar}Service.create(data);\n  }\n\n  @Put(":id")\n  async update(@Param("id") id: string, @Body() data: ${dtoClass}) {\n    return await this.${entityVar}Service.update(id, data);\n  }\n}\n`,
      },
      {
        path: path.join(context.backendModuleDir, `${context.businessName}.module.ts`),
        group: "backend",
        content: `import { Module } from "@nestjs/common";\nimport { TypeOrmModule } from "@nestjs/typeorm";\nimport { ${controllerClass} } from "./${context.businessName}.controller";\nimport { ${serviceClass} } from "./${context.businessName}.service";\nimport { ${entityClass} } from "./entities/${context.businessName}.entity";\n\n@Module({\n  imports: [TypeOrmModule.forFeature([${entityClass}]${repositoryDataSourceArg})],\n  controllers: [${controllerClass}],\n  providers: [${serviceClass}],\n})\nexport class ${moduleClass} {}\n`,
      },
      {
        path: path.join(context.backendModuleDir, `${context.businessName}.service.ts`),
        group: "backend",
        content: `import { Injectable } from "@nestjs/common";\nimport { InjectRepository } from "@nestjs/typeorm";\nimport { Repository } from "typeorm";\nimport { BaseService } from "@/common/services/base.service";\nimport { ${entityClass} } from "./entities/${context.businessName}.entity";\n\n@Injectable()\nexport class ${serviceClass} extends BaseService<${entityClass}> {\n  constructor(\n    @InjectRepository(${entityClass}${repositoryDataSourceArg})\n    private readonly ${entityVar}Repository: Repository<${entityClass}>,\n  ) {\n    super(${entityVar}Repository);\n  }\n}\n`,
      },
      {
        path: path.join(context.backendModuleDir, "dto", `${context.businessName}.dto.ts`),
        group: "backend",
        content: `import { z } from "zod";\nimport { ZodDto } from "@/core/decorators/zod-dto.decorator";\n\nexport const ${context.entityName}Schema = z.object({\n${dtoFields}\n});\n\n@ZodDto(${context.entityName}Schema)\nexport class ${dtoClass} {\n${dtoProps}\n}\n`,
      },
      {
        path: path.join(context.backendModuleDir, "entities", `${context.businessName}.entity.ts`),
        group: "backend",
        content: `${entityBaseImport ? `${entityBaseImport}\n` : ""}import { ${entityColumnImport} } from "typeorm";\n\n@Entity("${context.table.table_name}")\nexport class ${entityClass}${entityBaseName ? ` extends ${entityBaseName}` : ""} {\n${entityPrimaryField}${entityPrimaryField && entityFields ? "\n\n" : ""}${entityFields}\n}\n`,
      },
    ];
  }

  private buildFrontendPreviewFiles(context: GenerateContext): PreviewFileResult[] {
    const queryFields = context.queryColumns.map((column) => this.renderFrontendSearchField(column)).join("\n");
    const listColumns = context.listColumns.map((column) => this.renderFrontendListColumn(column)).join(',\n                    ');
    const formItems = context.formColumns
      .filter((column) => !this.isSystemColumn(column.column_name))
      .map((column) => this.renderFrontendFormItem(column))
      .join("\n");
    const initialFields = context.formColumns
      .filter((column) => !this.isSystemColumn(column.column_name))
      .map(
        (column) =>
          `  ${this.toCamelCase(column.column_name)}: ${this.getFrontendInitialValue(column)},`,
      )
      .join("\n");
    const hasDictSearch = context.queryColumns.some(
      (column) => column.view_type === "saSelect" && column.dict_type,
    );
    const hasDictForm = context.formColumns.some(
      (column) => column.view_type === "saSelect" && column.dict_type,
    );
    const hasCitySearch = context.queryColumns.some((column) => column.view_type === "cityLinkage");
    const hasCityForm = context.formColumns.some((column) => column.view_type === "cityLinkage");
    const hasImageList = context.listColumns.some((column) => column.view_type === "uploadImage");
    const hasImageForm = context.formColumns.some((column) => column.view_type === "uploadImage");
    const hasFileList = context.listColumns.some((column) => column.view_type === "uploadFile");
    const hasFileForm = context.formColumns.some((column) => column.view_type === "uploadFile");
    const hasRichTextList = context.listColumns.some((column) => column.view_type === "wangEditor");
    const hasRichTextForm = context.formColumns.some((column) => column.view_type === "wangEditor");
    const isDrawerForm = Number(context.table.component_type) === 2;
    const formWidth = Number(context.table.form_width) > 0 ? Number(context.table.form_width) : 720;
    const isFullForm = Number(context.table.is_full) === 1;
    const editContainerImport = isDrawerForm ? "Drawer" : "Modal";
    const editContainerProps = isDrawerForm
      ? `open={visible} title={title} width={${isFullForm ? '"100%"' : formWidth}} closable={false} maskClosable={false} onClose={close} extra={
        <Space>
          <Button onClick={close}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            确定
          </Button>
        </Space>
      }`
      : `open={visible} title={title} confirmLoading={loading} width={${isFullForm ? '"100%"' : formWidth}} onOk={handleSubmit} onCancel={close}`;
    const cityQueryColumns = context.queryColumns.filter((column) => column.view_type === "cityLinkage");
    const richTextSummaryHelper = hasRichTextList
      ? `const renderRichTextSummary = (value?: string) => {\n  if (!value) return "-";\n  const plainText = String(value).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();\n  if (!plainText) return "-";\n  return plainText.length > 100 ? \`\${plainText.slice(0, 100)}...\` : plainText;\n};\n\n`
      : "";
    const cityQueryTransform =
      cityQueryColumns.length > 0
        ? `const buildListParams = (params?: any) => {\n  const next = { ...(params || {}) };\n${cityQueryColumns
            .map((column) => {
              const field = this.toCamelCase(column.column_name);
              return `  if (Array.isArray(next.${field}) && next.${field}.length > 0) next.${field} = next.${field}[next.${field}.length - 1];`;
            })
            .join("\n")}\n  return next;\n};\n\n`
        : "";

    return [
      {
        path: path.join(context.frontendPageDir, "index.tsx"),
        group: "frontend",
        content: `import { useRef } from "react";\nimport { Col, Form, Input, message } from "antd";\nimport NestTable, { type ColumnDef, type TableRef } from "@/components/nest-table";\n${hasDictSearch ? 'import NestSelect from "@/components/nest-select";\n' : ""}${hasCitySearch ? 'import CityLinkage from "@/components/city-linkage";\n' : ""}${hasImageList ? 'import ImagePreview from "@/components/image-preview";\n' : ""}${hasFileList ? 'import FilePreview from "@/components/file-preview";\n' : ""}import { ${context.businessApiName}DeleteApi, ${context.businessApiName}ListApi } from "@/api/${context.packageName}/${context.businessName}";\nimport ${context.entityName}Edit, { type ${context.entityName}EditRef } from "./edit";\n\n${richTextSummaryHelper}${cityQueryTransform}const ${context.entityName}Index = () => {\n  const editRef = useRef<${context.entityName}EditRef>(null);\n  const tableRef = useRef<TableRef>(null);\n\n  return (\n    <>\n      <NestTable\n        ref={tableRef}\n        searchFields={\n          <>\n${queryFields}\n          </>\n        }\n        options={{\n          api: ${cityQueryColumns.length > 0 ? `(params: any) => ${context.businessApiName}ListApi(buildListParams(params))` : context.businessApiName + "ListApi"},\n          add: {\n            show: true,\n            auth: ["${context.packageName}/${context.businessName}/create"],\n            func: () => editRef.current?.open("add"),\n          },\n          edit: {\n            show: true,\n            auth: ["${context.packageName}/${context.businessName}/update"],\n            func: (record: any) => editRef.current?.open("edit", record),\n          },\n          delete: {\n            show: true,\n            auth: ["${context.packageName}/${context.businessName}/destroy"],\n            func: async (record: any) => {\n              await ${context.businessApiName}DeleteApi(record.id);\n              message.success("删除成功");\n              tableRef.current?.refresh();\n            },\n          },\n        }}\n        columns={[\n                    ${listColumns}\n        ] as ColumnDef[]}\n      />\n      <${context.entityName}Edit ref={editRef} onSuccess={() => tableRef.current?.refresh()} />\n    </>\n  );\n};\n\nexport default ${context.entityName}Index;\n`,
      },
      {
        path: path.join(context.frontendPageDir, "edit.tsx"),
        group: "frontend",
        content: `import { forwardRef, useImperativeHandle, useState } from "react";\nimport { Form, Input, InputNumber, ${editContainerImport},${isDrawerForm ? ' Button, Space,' : ""} message } from "antd";\n${hasDictForm ? 'import NestSelect from "@/components/nest-select";\n' : ""}${hasCityForm ? 'import CityLinkage from "@/components/city-linkage";\n' : ""}${hasImageForm ? 'import ImageUpload from "@/components/image-upload";\n' : ""}${hasFileForm ? 'import FileUpload from "@/components/file-upload";\n' : ""}${hasRichTextForm ? 'import WangEditor from "@/components/wang-editor";\n' : ""}import { ${context.businessApiName}CreateApi, ${context.businessApiName}UpdateApi } from "@/api/${context.packageName}/${context.businessName}";\n\nexport interface ${context.entityName}EditRef {\n  open: (type?: "add" | "edit", data?: Record<string, any>) => void;\n}\n\ninterface ${context.entityName}EditProps {\n  onSuccess?: () => void;\n}\n\nconst initialFormData = {\n${initialFields}\n};\n\nconst ${context.entityName}Edit = forwardRef<${context.entityName}EditRef, ${context.entityName}EditProps>(({ onSuccess }, ref) => {\n  const [visible, setVisible] = useState(false);\n  const [mode, setMode] = useState<"add" | "edit">("add");\n  const [loading, setLoading] = useState(false);\n  const [form] = Form.useForm();\n  const title = "${context.table.menu_name || context.entityName}" + (mode === "edit" ? " - 编辑" : " - 新增");\n\n  const open = (type: "add" | "edit" = "add", data?: Record<string, any>) => {\n    setMode(type);\n    form.resetFields();\n    form.setFieldsValue(type === "edit" && data ? { ...data } : { ...initialFormData });\n    setVisible(true);\n  };\n\n  const close = () => setVisible(false);\n\n  const handleSubmit = async () => {\n    try {\n      setLoading(true);\n      const values = await form.validateFields();\n      if (mode === "add") {\n        await ${context.businessApiName}CreateApi(values);\n      } else {\n        await ${context.businessApiName}UpdateApi(values.id, values);\n      }\n      message.success("操作成功");\n      onSuccess?.();\n      close();\n    } catch (error: any) {\n      if (error?.errorFields) return;\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  useImperativeHandle(ref, () => ({ open }));\n\n  return (\n    <${editContainerImport} ${editContainerProps}>\n      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>\n        <Form.Item name="id" hidden>\n          <Input />\n        </Form.Item>\n${formItems}\n      </Form>\n    </${editContainerImport}>\n  );\n});\n\n${context.entityName}Edit.displayName = "${context.entityName}Edit";\n\nexport default ${context.entityName}Edit;\n`,
      },
      {
        path: path.join("src", "api", context.packageName, `${context.businessName}.ts`),
        group: "frontend",
        content: `import request from "@/utils/request";\n\nexport const ${context.businessApiName}ListApi = (params?: any) => request.get("/${context.routePath}/index", { params });\nexport const ${context.businessApiName}CreateApi = (data: any) => request.post("/${context.routePath}", data);\nexport const ${context.businessApiName}UpdateApi = (id: string | number, data: any) => request.put(\`/${context.routePath}/\${id}\`, data);\nexport const ${context.businessApiName}DeleteApi = (id: string | number) => request.delete(\`/${context.routePath}/\${id}\`);\n`,
      },
    ];
  }

  private async syncMenus(context: GenerateContext): Promise<number[]> {
    const parentId = context.table.belong_menu_id ? Number(context.table.belong_menu_id) : 0;
    if (parentId) {
      const parentMenu = await this.menuService.getMenuById(parentId);
      if (!parentMenu) throw new ApiException("所属父菜单不存在");
      if (parentMenu.type !== "M") throw new ApiException("所属父菜单必须为菜单类型");
    }

    const pageMenu = await this.upsertMenu({
      parentId,
      name: context.table.menu_name,
      code: `${context.packageName}/${context.businessName}`,
      route: `/${context.packageName}/${context.businessName}`,
      component: `${context.packageName}/${context.businessName}/index`,
      type: "M",
      icon: "AppstoreOutlined",
      sort: context.table.sort ?? 0,
      isHidden: 2,
      isLayout: 1,
      status: 1,
      remark: context.table.remark ?? "",
    });

    const actions = [
      { name: "列表", code: `${context.packageName}/${context.businessName}/index`, sort: 10 },
      { name: "新增", code: `${context.packageName}/${context.businessName}/create`, sort: 20 },
      { name: "编辑", code: `${context.packageName}/${context.businessName}/update`, sort: 30 },
      { name: "删除", code: `${context.packageName}/${context.businessName}/destroy`, sort: 40 },
    ];

    const menuIds = [pageMenu.id];
    for (const action of actions) {
      const menu = await this.upsertMenu({
        parentId: pageMenu.id,
        name: action.name,
        code: action.code,
        route: "",
        component: "",
        type: "B",
        icon: "",
        sort: action.sort,
        isHidden: 1,
        isLayout: 1,
        status: 1,
        remark: `${context.table.menu_name}-${action.name}`,
      });
      menuIds.push(menu.id);
    }

    return menuIds;
  }

  private async upsertMenu(input: {
    parentId: number;
    name: string;
    code: string;
    route: string;
    component: string;
    type: string;
    icon: string;
    sort: number;
    isHidden: number;
    isLayout: number;
    status: number;
    remark: string;
  }) {
    const existing = await this.menuService.getMenuByPath(input.code);
    const payload = {
      parentId: input.parentId || 0,
      level: await this.buildMenuLevel(input.parentId),
      name: input.name,
      code: input.code,
      route: input.route || undefined,
      component: input.component || undefined,
      type: input.type,
      icon: input.type === "B" ? undefined : input.icon || "AppstoreOutlined",
      sort: input.sort,
      isHidden: input.isHidden,
      isLayout: input.isLayout,
      status: input.status,
      remark: input.remark || undefined,
    };

    if (existing) {
      return (await this.menuService.update(existing.id, payload)) as any;
    }

    return this.menuService.create(payload as any);
  }

  private async buildMenuLevel(parentId: number): Promise<string> {
    if (!parentId) return "0";
    const parent = await this.menuService.getMenuById(parentId);
    if (!parent) throw new ApiException("父菜单不存在");
    return `${parent.level || "0"},${parentId}`;
  }

  private async registerBackendModule(context: GenerateContext, adminApiRoot: string, moduleClassName: string) {
    if (context.packageName === "system") {
      const filePath = path.join(adminApiRoot, "src", "modules", "system", "system.module.ts");
      const importStatement = `import { ${moduleClassName} } from "./${context.businessName}/${context.businessName}.module";`;
      await this.insertModuleImport(filePath, importStatement, moduleClassName);
      return;
    }

    const packageModuleClassName = `${this.toPascalCase(context.packageName)}Module`;
    const packageModulePath = path.join(
      adminApiRoot,
      "src",
      "modules",
      context.packageName,
      `${context.packageName}.module.ts`,
    );

    await this.ensurePackageModule(packageModulePath, packageModuleClassName);

    const businessImportStatement = `import { ${moduleClassName} } from "./${context.businessName}/${context.businessName}.module";`;
    await this.insertModuleImport(packageModulePath, businessImportStatement, moduleClassName);

    const appModulePath = path.join(adminApiRoot, "src", "app.module.ts");
    const packageImportStatement = `import { ${packageModuleClassName} } from "./modules/${context.packageName}/${context.packageName}.module";`;
    await this.insertModuleImport(appModulePath, packageImportStatement, packageModuleClassName);
  }

  private async ensurePackageModule(filePath: string, moduleClassName: string) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(
        filePath,
        `import { Module } from "@nestjs/common";\n\n@Module({\n  imports: [],\n})\nexport class ${moduleClassName} {}\n`,
        "utf8",
      );
    }
  }

  private async insertModuleImport(filePath: string, importStatement: string, moduleClassName: string) {
    let content = await fs.readFile(filePath, "utf8");

    const importRegex = new RegExp(`import\\s*\\{\\s*${moduleClassName}\\s*\\}\\s*from\\s*["'][^"']+["'];?`);
    if (!importRegex.test(content)) {
      const moduleIndex = content.indexOf("@Module");
      content = `${content.slice(0, moduleIndex)}${importStatement}\n${content.slice(moduleIndex)}`;
    }

    content = content.replace(/imports:\s*\[([\s\S]*?)\]/m, (_match, inner) => {
      const innerText = String(inner);
      const moduleRegex = new RegExp(`\\b${moduleClassName}\\b`);
      if (moduleRegex.test(innerText)) {
        return `imports: [${innerText}]`;
      }
      const trimmed = innerText.trim();
      const prefix = trimmed ? `${trimmed}, ` : "";
      return `imports: [${prefix}${moduleClassName}]`;
    });

    await fs.writeFile(filePath, content, "utf8");
  }

  private renderFrontendSearchField(column: ToolGenerateColumnsEntity): string {
    const name = this.toCamelCase(column.column_name);
    const label = column.column_comment || column.column_name;
    if (["wangEditor", "uploadImage", "uploadFile"].includes(column.view_type)) {
      return "";
    }
    if (column.view_type === "cityLinkage") {
      return `            <Col span={6}>\n              <Form.Item name="${name}" label="${label}">\n                <CityLinkage placeholder="请选择${label}" />\n              </Form.Item>\n            </Col>`;
    }
    if (column.view_type === "saSelect" && column.dict_type) {
      return `            <Col span={6}>\n              <Form.Item name="${name}" label="${label}">\n                <NestSelect dict="${column.dict_type}" placeholder="请选择${label}" />\n              </Form.Item>\n            </Col>`;
    }
    return `            <Col span={6}>\n              <Form.Item name="${name}" label="${label}">\n                <Input placeholder="请输入${label}" allowClear />\n              </Form.Item>\n            </Col>`;
  }

  private renderFrontendListColumn(column: ToolGenerateColumnsEntity): string {
    const dataIndex = this.toCamelCase(column.column_name);
    const title = column.column_comment || column.column_name;
    if (column.view_type === "wangEditor") {
      return `{ title: "${title}", dataIndex: "${dataIndex}", width: 240, render: (value: string) => renderRichTextSummary(value) }`;
    }
    if (column.view_type === "cityLinkage") {
      return `{ title: "${title}", dataIndex: "${dataIndex}", width: 220, render: (value: string[] | string) => Array.isArray(value) ? value.join(" / ") : (value || "-") }`;
    }
    if (column.view_type === "uploadImage") {
      return `{ title: "${title}", dataIndex: "${dataIndex}", width: 180, render: (value: string | string[]) => <ImagePreview value={value} /> }`;
    }
    if (column.view_type === "uploadFile") {
      return `{ title: "${title}", dataIndex: "${dataIndex}", width: 240, render: (value: string | string[]) => <FilePreview value={value} /> }`;
    }
    if (column.view_type === "saSelect" && column.dict_type) {
      return `{ title: "${title}", dataIndex: "${dataIndex}", width: 140, type: "dict", dict: "${column.dict_type}" }`;
    }
    return `{ title: "${title}", dataIndex: "${dataIndex}", width: 160 }`;
  }

  private renderFrontendFormItem(column: ToolGenerateColumnsEntity): string {
    const name = this.toCamelCase(column.column_name);
    const label = column.column_comment || column.column_name;
    const isCityLinkage = column.view_type === "cityLinkage";
    const isRichText = column.view_type === "wangEditor";
    const isUploadImage = column.view_type === "uploadImage";
    const isUploadFile = column.view_type === "uploadFile";
    const rules =
      column.is_required === 2
        ? `rules={[{ required: true, message: "${isCityLinkage ? "请选择" : "请输入"}${label}" }]}`
        : "";

    if (column.view_type === "textarea") {
      return `        <Form.Item name="${name}" label="${label}" ${rules}>\n          <Input.TextArea rows={4} placeholder="请输入${label}" />\n        </Form.Item>`;
    }
    if (isRichText) {
      return `        <Form.Item name="${name}" label="${label}" ${rules}>\n          <WangEditor placeholder="请输入${label}" height={320} />\n        </Form.Item>`;
    }
    if (isCityLinkage) {
      return `        <Form.Item name="${name}" label="${label}" ${rules}>\n          <CityLinkage placeholder="请选择${label}" />\n        </Form.Item>`;
    }
    if (isUploadImage) {
      return `        <Form.Item name="${name}" label="${label}" valuePropName="value" ${rules}>\n          <ImageUpload placeholder="上传${label}" />\n        </Form.Item>`;
    }
    if (isUploadFile) {
      return `        <Form.Item name="${name}" label="${label}" valuePropName="value" ${rules}>\n          <FileUpload placeholder="上传${label}" />\n        </Form.Item>`;
    }
    if (column.view_type === "saSelect" && column.dict_type) {
      return `        <Form.Item name="${name}" label="${label}" ${rules}>\n          <NestSelect dict="${column.dict_type}" placeholder="请选择${label}" />\n        </Form.Item>`;
    }
    if (this.isNumericColumnType(column.column_type)) {
      return `        <Form.Item name="${name}" label="${label}" ${rules}>\n          <InputNumber style={{ width: "100%" }} placeholder="请输入${label}" />\n        </Form.Item>`;
    }
    return `        <Form.Item name="${name}" label="${label}" ${rules}>\n          <Input placeholder="请输入${label}" />\n        </Form.Item>`;
  }

  private renderEntityColumn(column: ToolGenerateColumnsEntity): string {
    const propertyName = this.toCamelCase(column.column_name);
    return `  @Column(${this.buildTypeOrmColumnOptions(column)})\n  ${propertyName}: ${this.toTypescriptType(column)};`;
  }

  private renderPrimaryColumn(columns: ToolGenerateColumnsEntity[]): string {
    const idColumn = columns.find((column) => String(column.column_name).toLowerCase() === "id");
    const comment = (idColumn?.column_comment || "主键ID").replace(/"/g, '\\"');
    return `  @PrimaryGeneratedColumn({ type: "int", unsigned: true, comment: "${comment}" })\n  id: number;`;
  }

  private renderZodField(column: ToolGenerateColumnsEntity): string {
    const required = column.is_required === 2 && column.is_pk !== 2;
    if (column.view_type === "cityLinkage") {
      return required ? "z.array(z.string()).min(1, \"请选择地区\")" : "z.array(z.string()).optional()";
    }
    if (column.view_type === "wangEditor") {
      return required ? 'z.string().min(1, "不能为空")' : "z.string().optional()";
    }
    if (column.view_type === "uploadFile") {
      return required ? 'z.string().min(1, "请上传文件")' : "z.string().optional()";
    }
    if (this.isNumericColumnType(column.column_type)) {
      return required ? "z.number()" : "z.number().optional()";
    }
    return required ? 'z.string().min(1, "不能为空")' : "z.string().optional()";
  }

  private getFrontendInitialValue(column: ToolGenerateColumnsEntity): string {
    if (column.view_type === "cityLinkage") return "[]";
    if (this.isNumericColumnType(column.column_type)) return "undefined";
    return '""';
  }

  private buildTypeOrmColumnOptions(column: ToolGenerateColumnsEntity): string {
    const baseType = this.getColumnBaseType(column.column_type);
    const length = this.extractSingleLength(column.column_type);
    const decimal = this.extractDecimal(column.column_type);
    const options = [
      `name: "${column.column_name}"`,
      `type: "${baseType}"`,
      `nullable: ${column.is_required === 2 ? "false" : "true"}`,
      `comment: "${(column.column_comment || column.column_name).replace(/"/g, '\\"')}"`,
    ];
    if (length && ["varchar", "char"].includes(baseType)) {
      options.push(`length: ${length}`);
    }
    if (decimal) {
      options.push(`precision: ${decimal.precision}`);
      options.push(`scale: ${decimal.scale}`);
    }
    return `{ ${options.join(", ")} }`;
  }

  private toTypescriptType(column: Pick<ToolGenerateColumnsEntity, "column_type">): string {
    const baseType = this.getColumnBaseType(column.column_type);
    if (this.isNumericBaseType(baseType)) return "number";
    if (["date", "datetime", "timestamp", "time", "year"].includes(baseType)) return "Date | string";
    if (baseType === "json") return "any";
    return "string";
  }

  private toDtoTypescriptType(column: Pick<ToolGenerateColumnsEntity, "column_type" | "view_type">): string {
    if (column.view_type === "cityLinkage") return "string[]";
    return this.toTypescriptType(column);
  }

  private inferViewType(column: ColumnMetaRow): string {
    const dataType = String(column.DATA_TYPE ?? "").toLowerCase();
    const columnName = String(column.COLUMN_NAME ?? "").toLowerCase();
    if (["text", "mediumtext", "longtext", "tinytext"].includes(dataType)) return "textarea";
    if (["date", "datetime", "timestamp", "time", "year"].includes(dataType)) return "date";
    if (columnName.endsWith("status") || columnName.endsWith("_type")) return "saSelect";
    if (this.isNumericBaseType(dataType)) return "inputNumber";
    return "input";
  }

  private inferQueryType(column: ColumnMetaRow): string {
    const dataType = String(column.DATA_TYPE ?? "").toLowerCase();
    return ["varchar", "char", "text", "tinytext", "mediumtext", "longtext"].includes(dataType) ? "like" : "eq";
  }

  private buildDatasourceOption(dataSource: DataSource, source: string) {
    const options = (dataSource.options ?? {}) as unknown as Record<string, unknown>;
    return {
      value: source,
      label: options.database,
      databaseName: options.database,
    };
  }

  private getDatabaseName(dataSource: DataSource): string {
    const options = (dataSource.options ?? {}) as unknown as Record<string, unknown>;
    const databaseName = options.database;
    if (!databaseName || typeof databaseName !== "string") {
      throw new ApiException("数据库连接未配置 database");
    }
    return databaseName;
  }

  private getDataSource(source: string) {
    switch (source) {
      case "nest_system":
        return this.nestSystemDataSource;
      case "db_center":
        return this.dbCenterDataSource;
      default:
        return null;
    }
  }

  private resolveEntityBaseMode(
    table: ToolGenerateTablesEntity,
    columns: ToolGenerateColumnsEntity[],
  ): "soft-delete" | "base" | "plain" {
    const columnSet = new Set(columns.map((column) => String(column.column_name).toLowerCase()));
    const hasBaseColumns = ["id", "created_by", "updated_by", "create_time", "update_time"].every((name) =>
      columnSet.has(name),
    );
    if (!hasBaseColumns) {
      return "plain";
    }
    if (Number(table.generate_model) === 1 && columnSet.has("delete_time")) {
      return "soft-delete";
    }
    return "base";
  }

  private resolveProjectRoot(projectName: string): string {
    const normalizedProjectName = String(projectName || "").trim();
    if (!normalizedProjectName) {
      throw new ApiException("未配置项目目录");
    }

    const isAbsolutePath = path.isAbsolute(normalizedProjectName);
    const candidates = [
      isAbsolutePath ? normalizedProjectName : "",
      path.resolve(process.cwd(), normalizedProjectName),
      path.resolve(process.cwd(), "..", normalizedProjectName),
    ];

    for (const candidate of candidates) {
      if (candidate && require("fs").existsSync(candidate)) {
        return candidate;
      }
    }

    throw new ApiException(`未找到项目目录 ${normalizedProjectName}`);
  }

  private toPascalCase(value: string): string {
    return String(value || "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_\-\s]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  }

  private toCamelCase(value: string): string {
    const pascal = this.toPascalCase(value);
    return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "";
  }

  private toKebabCase(value: string): string {
    return String(value || "")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/[_\s]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  }

  private isSystemColumn(columnName: string): boolean {
    return ["id", "create_time", "update_time", "delete_time", "created_by", "updated_by"].includes(
      String(columnName).toLowerCase(),
    );
  }

  private getColumnBaseType(columnType?: string | null): string {
    const match = String(columnType || "").match(/^([a-zA-Z]+)/);
    return (match?.[1] || "varchar").toLowerCase();
  }

  private extractSingleLength(columnType?: string | null): number | null {
    const match = String(columnType || "").match(/\((\d+)\)/);
    return match ? Number(match[1]) : null;
  }

  private extractDecimal(columnType?: string | null) {
    const match = String(columnType || "").match(/\((\d+),\s*(\d+)\)/);
    return match ? { precision: Number(match[1]), scale: Number(match[2]) } : null;
  }

  private isNumericBaseType(baseType: string): boolean {
    return ["int", "tinyint", "smallint", "mediumint", "bigint", "decimal", "float", "double"].includes(baseType);
  }

  private isNumericColumnType(columnType?: string | null): boolean {
    return this.isNumericBaseType(this.getColumnBaseType(columnType));
  }
}
