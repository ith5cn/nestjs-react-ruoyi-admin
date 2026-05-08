import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities/soft-delete.entity';
import { MenuEntity } from '@/system/menu/entities/menu.entity';
import { UserEntity } from '@/system/user/entities/user.entity';

@Entity('nest_system_role')
export class RoleEntity extends SoftDeleteEntity {
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
        length: 30,
        nullable: true,
        comment: '角色名称',
    })
    name: string;

    @Column({
        name: 'code',
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '角色代码',
    })
    code: string;

    @Column({
        name: 'data_scope',
        type: 'smallint',
        default: 1,
        comment: '数据范围(1:全部数据权限 2:自定义数据权限 3:本部门数据权限 4:本部门及以下数据权限 5:本人数据权限)',
    })
    dataScope: number;

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

    @ManyToMany(() => MenuEntity, (menu) => menu.roles)
    @JoinTable({
        name: 'nest_system_role_menu',
        joinColumns: [{ name: 'role_id', referencedColumnName: 'id' }],
        inverseJoinColumns: [{ name: 'menu_id', referencedColumnName: 'id' }],
    })
    menus: MenuEntity[];

    @ManyToMany(() => UserEntity, (user) => user.roles)
    users: UserEntity[];
}
