import { Column, Entity } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities/soft-delete.entity';

@Entity('nest_system_attachment')
export class AttachmentEntity extends SoftDeleteEntity {
    @Column({
        name: 'storage_mode',
        type: 'smallint',
        default: 1,
        comment: '存储模式 (1 本地 2 阿里云 3 七牛云 4 腾讯云)',
    })
    storageMode: number;

    @Column({
        name: 'origin_name',
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '原文件名',
    })
    originName: string;

    @Column({
        name: 'object_name',
        type: 'varchar',
        length: 50,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '新文件名',
    })
    objectName: string;

    @Column({
        type: 'varchar',
        length: 64,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '文件hash',
    })
    hash: string;

    @Column({
        name: 'mime_type',
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '资源类型',
    })
    mimeType: string;

    @Column({
        name: 'storage_path',
        type: 'varchar',
        length: 100,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '存储目录',
    })
    storagePath: string;

    @Column({
        type: 'varchar',
        length: 10,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '文件后缀',
    })
    suffix: string;

    @Column({
        name: 'size_byte',
        type: 'bigint',
        nullable: true,
        comment: '字节数',
    })
    sizeByte: string;

    @Column({
        name: 'size_info',
        type: 'varchar',
        length: 50,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '文件大小',
    })
    sizeInfo: string;

    @Column({
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: 'url地址',
    })
    url: string;

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
