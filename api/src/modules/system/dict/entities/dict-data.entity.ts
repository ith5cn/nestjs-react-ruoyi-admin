import { Column, Entity } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities/soft-delete.entity';

@Entity('nest_system_dict_data')
export class DictDataEntity extends SoftDeleteEntity {
    @Column({
        name: 'type_id',
        type: 'int',
        unsigned: true,
        nullable: true,
        comment: '字典类型ID',
    })
    typeId: number;

    @Column({
        type: 'varchar',
        length: 50,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '字典标签',
    })
    label: string;

    @Column({
        type: 'varchar',
        length: 100,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '字典值',
    })
    value: string;

    @Column({
        type: 'varchar',
        length: 50,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '字典颜色',
    })
    color: string;

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
        unsigned: true,
        default: 0,
        comment: '排序',
    })
    sort: number;

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
