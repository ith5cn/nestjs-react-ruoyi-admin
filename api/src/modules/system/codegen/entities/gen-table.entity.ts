import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity("nest_tool_generate_tables")
export class ToolGenerateTablesEntity extends BaseEntity {
  @Column({ name: "table_name", type: "varchar", length: 200, default: null, comment: "表名称" })
  table_name: string;

  @Column({ name: "table_comment", type: "varchar", length: 500, default: null, comment: "表注释" })
  table_comment: string;

  @Column({ name: "package_name", type: "varchar", length: 100, default: null, comment: "包名" })
  package_name: string;

  @Column({ name: "business_name", type: "varchar", length: 50, default: null, comment: "业务名称" })
  business_name: string;

  @Column({ name: "class_name", type: "varchar", length: 50, default: null, comment: "类名称" })
  class_name: string;

  @Column({ name: "menu_name", type: "varchar", length: 100, default: null, comment: "生成菜单名称" })
  menu_name: string;

  @Column({ name: "belong_menu_id", type: "int", default: null, comment: "所属菜单ID" })
  belong_menu_id: number;

  @Column({ name: "tpl_category", type: "varchar", length: 100, default: null, comment: "生成模板类型" })
  tpl_category: string;

  @Column({ name: "generate_path", type: "varchar", length: 100, default: "saiadmin-vue", comment: "生成路径" })
  generate_path: string;

  @Column({ name: "generate_model", type: "smallint", default: 1, comment: "生成模式, 1 软删除 2 非软删除" })
  generate_model: number;

  @Column({ name: "component_type", type: "smallint", default: 1, comment: "组件显示方式， 1 模态框 2 抽屉" })
  component_type: number;

  @Column({ name: "sort", type: "tinyint", default: 0, comment: "排序" })
  sort: number;

  @Column({ name: "form_width", type: "int", default: 600, comment: "表单宽度" })
  form_width: number;

  @Column({ name: "is_full", type: "tinyint", default: 1, comment: "是否全屏" })
  is_full: number;

  @Column({ name: "remark", type: "varchar", length: 255, default: null, comment: "备注" })
  remark: string;

  @Column({ name: "source", type: "varchar", length: 255, default: null, comment: "数据源" })
  source: string;
}
