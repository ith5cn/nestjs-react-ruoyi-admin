import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities/soft-delete.entity';

@Entity('nest_system_post')
export class PostEntity extends SoftDeleteEntity {
    @Column({
        name: 'name',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '岗位名称',
    })
    name: string;

    @Column({
        name: 'code',
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '岗位代码',
    })
    code: string;

    @Column({
        name: 'sort',
        type: 'smallint',
        unsigned: true,
        default: 0,
        comment: '排序',
    })
    sort: number;

    @Column({
        name: 'status',
        type: 'smallint',
        default: 1,
        comment: '状态 (1正常 2停用)',
    })
    status: number;

    @Column({
        name: 'remark',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '备注',
    })
    remark: string;
}
