import { BaseEntity } from '@/common/entities/base.entity';
import { Column, DeleteDateColumn, Entity } from 'typeorm';

@Entity('nest_tool_crontab')
export class CrontabEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '任务名称',
    })
    name: string;

    @Column({
        type: 'smallint',
        default: 4,
        comment: '任务类型',
    })
    type: number;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '调用任务字符串',
    })
    target: string;

    @Column({
        type: 'varchar',
        length: 1000,
        nullable: true,
        comment: '调用任务参数',
    })
    parameter: string;

    @Column({
        name: 'task_style',
        type: 'tinyint',
        width: 1,
        nullable: true,
        comment: '执行类型',
    })
    taskStyle: number;

    @Column({
        type: 'varchar',
        length: 32,
        nullable: true,
        comment: '任务执行表达式',
    })
    rule: string;

    @Column({
        type: 'smallint',
        default: 1,
        comment: '是否单次执行 (1 是 2 不是)',
    })
    singleton: number;

    @Column({
        type: 'smallint',
        default: 1,
        comment: '状态 (1正常 2停用)',
    })
    status: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '备注',
    })
    remark: string;

    @DeleteDateColumn({
        name: 'delete_time',
        type: 'datetime',
        nullable: true,
        comment: '删除时间',
    })
    deleteTime: string;
}
