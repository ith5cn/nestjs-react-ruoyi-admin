import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity("nest_system_login_log")
export class NestSystemLoginLogEntity extends BaseEntity {
  @Column({ name: "remark", type: "varchar", nullable: true, comment: "备注", length: 255 })
  remark: string;

  @Column({ name: "username", type: "varchar", nullable: true, comment: "登录用户", length: 20 })
  username: string;

  @Column({ name: "status", type: "smallint", nullable: false, comment: "登录状态" })
  status: number;

  @Column({ name: "ip", type: "varchar", nullable: true, comment: "登录IP", length: 45 })
  ip: string;

  @Column({ name: "ip_location", type: "varchar", nullable: true, comment: "登录地点", length: 255 })
  ipLocation: string;

  @Column({ name: "os", type: "varchar", nullable: true, comment: "操作系统", length: 50 })
  os: string;

  @Column({ name: "browser", type: "varchar", nullable: true, comment: "浏览器", length: 50 })
  browser: string;

  @Column({ name: "message", type: "varchar", nullable: true, comment: "登录信息", length: 50 })
  message: string;

  @Column({ name: "login_time", type: "datetime", nullable: false, comment: "登录时间" })
  loginTime: Date | string;
}
