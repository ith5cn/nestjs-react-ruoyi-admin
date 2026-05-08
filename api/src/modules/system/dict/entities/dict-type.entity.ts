import { Column, Entity } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities/soft-delete.entity';

@Entity('nest_system_dict_type')
export class DictTypeEntity extends SoftDeleteEntity {
    @Column({
        type: 'varchar',
        length: 50,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '字典名称',
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 100,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '字典标示',
    })
    code: string;

    @Column({
        type: 'smallint',
        default: 1,
        comment: '状态 (1正常 2停用)',
    })
    status: number;

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
