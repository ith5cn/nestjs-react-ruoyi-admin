import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity("nest_system_notice")
export class NoticeEntity extends BaseEntity {
  @Column({ name: "message_id", type: "int", nullable: true, comment: "消息ID" })
  messageId: number;

  @Column({ name: "title", type: "varchar", nullable: true, comment: "标题", length: 255 })
  title: string;

  @Column({ name: "type", type: "smallint", nullable: true, comment: "公告类型" })
  type: number;

  @Column({ name: "content", type: "text", nullable: true, comment: "公告内容" })
  content: string;

  @Column({ name: "click_num", type: "int", nullable: true, comment: "浏览次数" })
  clickNum: number;

  @Column({ name: "remark", type: "varchar", nullable: true, comment: "备注", length: 255 })
  remark: string;
}
