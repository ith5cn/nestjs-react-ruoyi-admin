import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity("nest_system_oper_log")
export class OperLogEntity extends BaseEntity {
  @Column({ name: "app", type: "varchar", nullable: true, comment: "应用名称", length: 50 })
  app: string;

  @Column({ name: "method", type: "varchar", nullable: true, comment: "请求方式", length: 20 })
  method: string;

  @Column({ name: "request_data", type: "text", nullable: true, comment: "请求数据" })
  requestData: string;

  @Column({ name: "remark", type: "varchar", nullable: true, comment: "备注", length: 255 })
  remark: string;

  @Column({ name: "username", type: "varchar", nullable: true, comment: "操作用户", length: 20 })
  username: string;

  @Column({ name: "service_name", type: "varchar", nullable: true, comment: "业务名称", length: 30 })
  serviceName: string;

  @Column({ name: "router", type: "varchar", nullable: true, comment: "请求路由", length: 500 })
  router: string;

  @Column({ name: "ip", type: "varchar", nullable: true, comment: "操作IP", length: 45 })
  ip: string;

  @Column({ name: "ip_location", type: "varchar", nullable: true, comment: "操作地点", length: 255 })
  ipLocation: string;
}
