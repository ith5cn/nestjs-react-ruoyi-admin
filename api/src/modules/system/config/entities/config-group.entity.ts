import { SoftDeleteEntity } from "@/common/entities/soft-delete.entity";
import { Column, DeleteDateColumn, Entity } from "typeorm";

@Entity("nest_system_config_group")
export class ConfigGroupEntity extends SoftDeleteEntity {
  @Column({ name: "name", type: "varchar", length: 50, nullable: true, comment: "字典名称" })
  name: string;

  @Column({ name: "code", type: "varchar", length: 100, nullable: true, comment: "字典标示" })
  code: string;

  @Column({ name: "remark", type: "varchar", length: 255, nullable: true, comment: "备注" })
  remark: string;

}
