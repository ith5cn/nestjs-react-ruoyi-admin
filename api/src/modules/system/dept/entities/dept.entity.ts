import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('nest_system_dept')
export class DeptEntity extends BaseEntity {
    @Column({
        name: 'parent_id',
        type: 'int',
        unsigned: true,
        nullable: true,
        comment: '父ID',
    })
    parentId: number;

    @Column({
        type: 'varchar',
        length: 500,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '组级集合',
    })
    level: string;

    @Column({
        type: 'varchar',
        length: 30,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '部门名称',
    })
    name: string;

    @Column({
        type: 'smallint',
        default: 1,
        comment: '状态 (1正常 2停用)',
    })
    status: number;

    @Column({
        name: 'sort',
        type: 'smallint',
        unsigned: true,
        default: 0,
        comment: '排序',
    })
    sort: number;

    @Column({
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '备注',
    })
    remark: string;
}
