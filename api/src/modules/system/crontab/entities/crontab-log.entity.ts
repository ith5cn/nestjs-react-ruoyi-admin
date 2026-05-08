import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('nest_tool_crontab_log')
export class CrontabLogEntity {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
        comment: 'ID',
    })
    id: number;

    @Column({
        name: 'crontab_id',
        type: 'int',
        unsigned: true,
        nullable: true,
        comment: '任务ID',
    })
    crontabId: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '任务名称',
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '任务调用目标',
    })
    target: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: '任务调用参数',
    })
    parameter: string;

    @Column({
        name: 'result_info',
        type: 'text',
        nullable: true,
        comment: '执行结果信息',
    })
    resultInfo: string;

    @Column({
        name: 'exception_info',
        type: 'text',
        nullable: true,
        comment: '异常信息',
    })
    exceptionInfo: string;

    @Column({
        name: 'trigger_type',
        type: 'smallint',
        default: 1,
        comment: '触发方式(1定时 2手动)',
    })
    triggerType: number;

    @Column({
        type: 'smallint',
        default: 0,
        comment: '执行状态(0执行中 1成功 2失败 3跳过)',
    })
    status: number;

    @Column({
        name: 'start_time',
        type: 'datetime',
        nullable: true,
        comment: '开始执行时间',
    })
    startTime: string;

    @Column({
        name: 'end_time',
        type: 'datetime',
        nullable: true,
        comment: '结束执行时间',
    })
    endTime: string;

    @Column({
        name: 'duration_ms',
        type: 'int',
        nullable: true,
        comment: '执行耗时(毫秒)',
    })
    durationMs: number;

    @CreateDateColumn({
        name: 'create_time',
        type: 'datetime',
        nullable: true,
        comment: '创建时间',
    })
    createTime: string;

    @UpdateDateColumn({
        name: 'update_time',
        type: 'datetime',
        nullable: true,
        comment: '修改时间',
    })
    updateTime: string;

    @DeleteDateColumn({
        name: 'delete_time',
        type: 'datetime',
        nullable: true,
        comment: '删除时间',
    })
    deleteTime: string;
}
