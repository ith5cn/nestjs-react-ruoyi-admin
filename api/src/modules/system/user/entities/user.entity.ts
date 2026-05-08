import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../../common/entities/soft-delete.entity';
import { RoleEntity } from '@/system/role/entities/role.entity';

@Entity('nest_system_user')
export class UserEntity extends SoftDeleteEntity {
    @Column({
        type: 'varchar',
        length: 20,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        comment: '用户名',
        unique: true,
    })
    username: string;

    @Column({
        type: 'varchar', // Length 100 in SQL
        length: 100,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        comment: '密码',
        select: false, // Usually hide password by default
    })
    password: string;

    @Column({
        type: 'varchar',
        length: 3,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        default: '100',
        comment: '用户类型:(100系统内部用户，200系统外部用户)',
    })
    user_type: string;

    @Column({
        type: 'varchar',
        length: 30,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '用户昵称',
    })
    nickname: string;

    @Column({
        type: 'varchar',
        length: 11,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '手机',
    })
    phone: string;

    @Column({
        type: 'varchar',
        length: 50,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '用户邮箱',
    })
    email: string;

    @Column({
        name: 'dept_id',
        type: 'int',
        unsigned: true,
        nullable: true,
        comment: '部门ID',
    })
    deptId: number;

    @Column({
        name: 'post_id',
        type: 'varchar',
        length: 20,
        nullable: true,
        comment: '岗位ID',
    })
    postId: string;

    @Column({
        type: 'smallint',
        default: 1,
        comment: '状态 (1正常 2停用)',
    })
    status: number;

    @Column({
        name: 'login_ip',
        type: 'varchar',
        length: 45,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '最后登陆IP',
    })
    loginIp: string;

    @Column({
        name: 'login_time',
        type: 'datetime',
        nullable: true,
        comment: '最后登陆时间',
    })
    loginTime: string;

    @Column({
        name: 'dashboard',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '后台首页类型',
    })
    dashboard: string

    @Column({
        name: 'backend_setting',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '后台设置',
    })
    backendSetting: string;

    @Column({
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_bin',
        nullable: true,
        comment: '备注',
    })
    remark: string;

    @ManyToMany(() => RoleEntity, (role) => role.users)
    @JoinTable({
        name: 'nest_system_user_role',
        joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
        inverseJoinColumns: [{ name: 'role_id', referencedColumnName: 'id' }],
    })
    roles: RoleEntity[];

}
