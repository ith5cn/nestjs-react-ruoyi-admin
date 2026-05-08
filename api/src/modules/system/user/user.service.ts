import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, FindManyOptions } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import { BaseService } from "src/common/services/base.service";
import { ApiException } from "@/common/exceptions/api.exception";
import { SecurityUtil } from "@/common/utils/security.util";
import { RoleService } from "../role/role.service";
import { MenuService } from "../menu/menu.service";
import { DeptService } from "../dept/dept.service";
import { PostService } from "../post/post.service";

@Injectable()

export class UserService extends BaseService<UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService,
        @Inject(forwardRef(() => MenuService))
        private readonly menuService: MenuService,
        private readonly deptService: DeptService,
        private readonly postService: PostService,
    ) { super(userRepository); }

    /**
     * 重写 getList 用于处理 roles 数组
     */
    async getList(
        page: number,
        size: number,
        options?: FindManyOptions<UserEntity>,
    ): Promise<{ data: UserEntity[]; total: number }> {
        const { data, total } = await super.getList(page, size, options);
        return {
            data: data.map(user => {
                if (user.roles) {
                    user.roles = user.roles.map(r => r.id) as any;
                }
                return user;
            }),
            total,
        };
    }

    /**
     * 创建用户
     */
    async create(data: any): Promise<UserEntity> {
        const { roles, password, ...createData } = data;

        if (password) {
            createData.password = await SecurityUtil.encryptPassword(password);
        }

        if (Array.isArray(createData.postId)) {
            createData.postId = createData.postId.length > 0 ? createData.postId.join(',') : '';
        }

        const entity = this.userRepository.create(createData as unknown as UserEntity);
        const savedEntity = await this.userRepository.save(entity);

        if (roles && roles.length > 0) {
            const roleEntities = await this.roleService.getAll({
                where: { id: In(roles) }
            });
            savedEntity.roles = roleEntities;
            await this.userRepository.save(savedEntity);
        }

        return savedEntity;
    }

    /**
     * 更新用户
     */
    async update(id: any, data: any): Promise<UserEntity | null> {
        const { roles, password, ...updateData } = data;

        if (Array.isArray(updateData.postId)) {
            updateData.postId = updateData.postId.length > 0 ? updateData.postId.join(',') : '';
        }

        if (Object.keys(updateData).length > 0) {
            await this.userRepository.update(id, updateData);
        }

        if (roles !== undefined) {
            const user = await this.userRepository.findOne({ where: { id } });
            if (user) {
                if (roles && roles.length > 0) {
                    const roleEntities = await this.roleService.getAll({
                        where: { id: In(roles) }
                    });
                    user.roles = roleEntities;
                } else {
                    user.roles = [];
                }
                await this.userRepository.save(user);
            }
        }

        return await this.read(id);
    }

    /**
     * 获取用户详情
     */
    async read(id: any): Promise<UserEntity | null> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles']
        });
        if (user && user.roles) {
            user.roles = user.roles.map(r => r.id) as any;
        }
        return user;
    }

    /**
     * 根据邮箱查询
     */
    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }

    /**
     * 根据用户名查询
     */
    async findByUsername(username: string) {
        return await this.userRepository.createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.username = :username', { username })
            .getOne();
    }

    /**
     * 设置密码
     */
    async setPassword(id, data) {

        const userInfo = await this.userRepository.createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :id', { id })
            .getOne();

        if (!userInfo) {
            throw new ApiException('数据不存在');
        }

        const isPass = await SecurityUtil.comparePassword(data.oldPassword, userInfo.password);
        if (!isPass) {
            throw new ApiException('旧密码错误');
        }

        const hash = await SecurityUtil.encryptPassword(data.password);

        return await this.update(id, { password: hash });
    }

    /**
     * 绑定角色
     */
    async bindRole(id: any, data: any) {
        let user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new ApiException('数据不存在');
        }

        const roleEntities = await this.roleService.getAll({
            where: { id: In(data.ids) }
        });
        user.roles = roleEntities;
        await this.userRepository.save(user);

        // 绑定完角色后立即刷新该用户的缓存，使其权限代码生效
        await this.refreshCache(id);

        return true;
    }

    /**
     * 根据userId获取roleIds
     */
    async getRoleIdsByUserId(userId: number) {

        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });
        if (!user) {
            throw new ApiException('10001:用户不存在');
        }
        return (user.roles || []).map(role => role.id);
    }

    /**
     * 获取所有超级管理员的用户ID
     */
    async getSuperAdminIds(): Promise<number[]> {
        const users = await this.userRepository.createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('role.code = :code', { code: 'super_admin' })
            .select(['user.id'])
            .getMany();
        return users.map(user => user.id);
    }

    /**
     * 获取当前用户信息 (附带角色等详细信息)
     */
    async getCurrentSystemUser(userPayload: any) {

        // 读取缓存
        // const cacheUser = await this.redisService.get(`system_user_info_${userPayload.id}`);
        // if (cacheUser) {
        //     return JSON.parse(cacheUser);
        // }

        // 没有缓存，读取这个
        const userInfo = await this.userRepository.findOne({
            where: { id: userPayload.id },
            relations: ['roles'] // 如果有 dept 也可以加上 'dept'
        });

        if (!userInfo) {
            throw new ApiException('10001:用户不存在');
        }
        let roleIds = userInfo.roles.map(role => role.id);


        console.log("roleIds", roleIds)

        let routers: any[] = [];
        let codes: string[] | string = [];

        // 如果角色是超级管理员
        if (roleIds.includes(1)) {
            // 指定首页
            let menus = await this.menuService.getAllMenu();
            menus.map((item) => {
                if (item.code === "dashboard") {
                    item.component = "system/home/index"
                }
            })
            routers = this.menuService.arrayToTree(menus);
            codes = '*';

        } else {
            // 获取该用户的路由/菜单
            routers = await this.menuService.getPermissionsMenu(userPayload.id);

            // 获取该用户的codes
            codes = await this.menuService.getCodes(userPayload.id);
        }
        // 部门
        const depts = await this.deptService.read(userInfo.deptId)

        // 岗位
        const posts = await this.postService.read(userInfo.postId)

        // 剔除密码
        const { password, roles, ...result } = userInfo;

        // 存储用户信息
        await this.redisService.set(`system_user_info_${userInfo.id}`, JSON.stringify({
            user: result,
            roles: roles?.map(role => role.id) || [],
            routers,
            codes,
            posts,
            depts
        }));

        return {
            user: result,
            roles: roles?.map(role => role.id) || [],
            routers,
            codes,
            posts,
            depts
        };
    }

    /**
     * 刷新用户缓存
     */
    async refreshCache(userId: number) {
        const payload = { id: userId };
        // 先删除旧缓存
        await this.redisService.del(`system_user_info_${userId}`);
        // 重新获取并生成新缓存
        await this.getCurrentSystemUser(payload);
        return true;
    }

    /**
     * 获取用户选择下拉
     */
    async authList(userPayload: any) {
        const admin = await this.getAdminInfo()
        // console.log(admin.roles);

        // 超级管理员返回所有用户
        if (admin.roles.includes(1)) {
            const data = await this.userRepository.find({
                select: ['id', 'username', 'nickname'],
                where: { status: 1 },
                order: { id: 'ASC' }
            });
            return data.map(item => {
                return {
                    label: item.username,
                    value: item.id
                }
            })
        }

        // 非管理员只返回自己
        const data = await this.userRepository.find({
            select: ['id', 'username', 'nickname'],
            where: { id: userPayload.id, status: 1 },
        });
        return data.map(item => {
            return {
                label: item.username,
                value: item.id
            }
        })
    }
}