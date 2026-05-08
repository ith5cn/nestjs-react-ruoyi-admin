import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities/soft-delete.entity';
import { RoleEntity } from '@/system/role/entities/role.entity';

@Entity('nest_system_menu')
export class MenuEntity extends SoftDeleteEntity {
    @Column({
        name: 'parent_id',
        type: 'int',
        unsigned: true,
        nullable: true,
        comment: '父ID',
    })
    parentId: number;

    @Column({
        name: 'level',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '组级集合',
    })
    level: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '菜单名称',
    })
    name: string;

    @Column({
        name: 'code',
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '菜单标识代码',
    })
    code: string;

    @Column({
        name: 'icon',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '菜单图标',
    })
    icon: string;

    @Column({
        name: 'route',
        type: 'varchar',
        length: 200,
        nullable: true,
        comment: '路由地址',
    })
    route: string;

    @Column({
        name: 'component',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '组件路径',
    })
    component: string;

    @Column({
        name: 'redirect',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '跳转地址',
    })
    redirect: string;

    @Column({
        name: 'is_hidden',
        type: 'smallint',
        default: 1,
        comment: '是否隐藏 (1是 2否)',
    })
    isHidden: number;

    @Column({
        name: 'is_layout',
        type: 'tinyint',
        unsigned: true,
        default: 1,
        comment: '继承layout',
    })
    isLayout: number;

    @Column({
        name: 'type',
        type: 'char',
        length: 1,
        default: '',
        comment: '菜单类型, (M菜单 B按钮 L链接 I iframe)',
    })
    type: string;

    @Column({
        name: 'status',
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
        name: 'remark',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '备注',
    })
    remark: string;

    @ManyToMany(() => RoleEntity, (role) => role.menus)
    roles: RoleEntity[];



}
