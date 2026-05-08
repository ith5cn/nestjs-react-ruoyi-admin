import { BaseEntity } from "@/common/entities/base.entity";
import { Column, DeleteDateColumn, Entity } from "typeorm";

@Entity('nest_tool_generate_columns')

export class ToolGenerateColumnsEntity extends BaseEntity {

    @Column({ name: 'table_id', type: 'int', unsigned: true, default: null, comment: '所属表ID' })
    table_id: number;

    @Column({ name: 'column_name', type: 'varchar', length: 200, default: null, comment: '字段名称' })
    column_name: string;

    @Column({ name: 'column_comment', type: 'varchar', length: 255, default: null, comment: '字段注释' })
    column_comment: string;

    @Column({ name: 'column_type', type: 'varchar', length: 50, default: null, comment: '字段类型' })
    column_type: string;

    @Column({ name: 'default_value', type: 'varchar', length: 50, default: null, comment: '默认值' })
    default_value: string;

    @Column({ name: 'is_pk', type: 'smallint', default: 1, comment: '1 非主键 2 主键' })
    is_pk: number;

    @Column({ name: 'is_required', type: 'smallint', default: 1, comment: '1 非必填 2 必填' })
    is_required: number;

    @Column({ name: 'is_insert', type: 'smallint', default: 1, comment: '1 非插入字段 2 插入字段' })
    is_insert: number;

    @Column({ name: 'is_edit', type: 'smallint', default: 1, comment: '1 非编辑字段 2 编辑字段' })
    is_edit: number;

    @Column({ name: 'is_list', type: 'smallint', default: 1, comment: '1 非列表显示字段 2 列表显示字段' })
    is_list: number;

    @Column({ name: 'is_query', type: 'smallint', default: 1, comment: '1 非查询字段 2 查询字段' })
    is_query: number;

    @Column({ name: 'is_sort', type: 'smallint', default: 1, comment: '1 非排序 2 排序' })
    is_sort: number;

    @Column({ name: 'query_type', type: 'varchar', length: 100, default: 'eq', comment: '查询方式 eq 等于, neq 不等于, gt 大于, lt 小于, like 范围' })
    query_type: string;

    @Column({ name: 'view_type', type: 'varchar', length: 100, default: 'text', comment: '页面控件,text, textarea, password, select, checkbox, radio, date, upload, ma-upload(封装的上传控件)' })
    view_type: string;

    @Column({ name: 'dict_type', type: 'varchar', length: 200, default: null, comment: '字典类型' })
    dict_type: string;

    @Column({ name: 'allow_roles', type: 'varchar', length: 255, default: null, comment: '允许查看该字段的角色' })
    allow_roles: string;

    @Column({ name: 'sort', type: 'tinyint', unsigned: true, default: 0, comment: '排序' })
    sort: number;

    @Column({ name: 'remark', type: 'varchar', length: 255, default: null, comment: '备注' })
    remark: string;

    @DeleteDateColumn({ name: 'delete_time', type: 'datetime', nullable: true, comment: '删除时间' })
    deleteTime: Date;
}
