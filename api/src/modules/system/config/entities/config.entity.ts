import { SoftDeleteEntity } from "@/common/entities/soft-delete.entity";
import { Column, Entity } from "typeorm";

@Entity("nest_system_config")
export class ConfigEntity extends SoftDeleteEntity {
  @Column({ name: "group_id", type: "int", nullable: true, comment: "组id" })
  group_id: number;

  @Column({ name: "key", type: "varchar", length: 32, comment: "配置键名" })
  key: string;

  @Column({ name: "value", type: "text", nullable: true, comment: "配置值" })
  value: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: true, comment: "配置名称" })
  name: string;

  @Column({ name: "input_type", type: "varchar", length: 32, nullable: true, comment: "数据输入类型" })
  input_type: string;

  @Column({ name: "config_select_data", type: "varchar", length: 500, nullable: true, comment: "配置选项数据" })
  config_select_data: string;

  @Column({ name: "sort", type: "smallint", unsigned: true, default: 0, comment: "排序" })
  sort: number;

  @Column({ name: "remark", type: "varchar", length: 255, nullable: true, comment: "备注" })
  remark: string;
}
