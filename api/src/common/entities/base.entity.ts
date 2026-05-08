import {
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn({
        type: 'int',
        unsigned: true,
        comment: '用户ID,主键',
    })
    id: number;
    @Column({
        name: 'created_by',
        type: 'int',
        nullable: true,
        comment: '创建者',
    })
    createdBy: number;

    @Column({
        name: 'updated_by',
        type: 'int',
        nullable: true,
        comment: '更新者',
    })
    updatedBy: number;

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
}
