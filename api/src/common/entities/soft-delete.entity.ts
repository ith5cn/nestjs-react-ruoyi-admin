import { DeleteDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class SoftDeleteEntity extends BaseEntity {
    @DeleteDateColumn({
        name: 'delete_time',
        type: 'datetime',
        nullable: true,
        comment: '删除时间',
    })
    deleteTime: string;
}
