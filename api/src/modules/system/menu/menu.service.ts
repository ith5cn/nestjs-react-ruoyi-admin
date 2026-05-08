import { BaseService } from "@/common/services/base.service";
import { MenuEntity } from "./entities/menu.entity";
import { Injectable, InternalServerErrorException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MenuDto } from "./dto/menu.dto";
import { UserService } from "../user/user.service";
import { RedisService } from "@/core/redis/redis.service";
import { ApiException } from "@/common/exceptions/api.exception";

@Injectable()
export class MenuService extends BaseService<MenuEntity> {
    constructor(
        @InjectRepository(MenuEntity)
        private readonly menuRepository: Repository<MenuEntity>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        protected readonly redisService: RedisService,
    ) {
        super(menuRepository)
    }

    /**
     * 清除菜单全局缓存
     */
    private async clearGlobalMenuCache() {
        await this.redisService.del('system_all_menu_codes');
    }

    /**
     * 清除关联该菜单的所有用户的权限缓存
     */
    private async clearMenuRelatedUsersCache(menuId?: number) {
        const affectedUserIds = new Set<number>();

        // 1. 如果传入了菜单ID，则查找该菜单关联的普通用户
        if (menuId) {
            const menuWithRolesUser = await this.menuRepository.findOne({
                where: { id: menuId },
                relations: ['roles', 'roles.users']
            });

            if (menuWithRolesUser && menuWithRolesUser.roles) {
                menuWithRolesUser.roles.forEach(role => {
                    if (role.users) {
                        role.users.forEach(user => {
                            affectedUserIds.add(user.id);
                        });
                    }
                });
            }
        }

        // 2. 超级管理员拥有动态的最全菜单权限，直接全部获取并加入清理队列
        const superAdminIds = await this.userService.getSuperAdminIds();
        superAdminIds.forEach(id => affectedUserIds.add(id));

        // 3. 批量删除这些最终计算得出用户的权限缓存
        for (const userId of affectedUserIds) {
            await this.redisService.del(`system_user_info_${userId}`);
        }
    }

    /**
     * 根据请求URL模糊推断菜单 (主要用于操作日志等通过URL匹配业务)
     * @param url 请求路径 (可能是如 /system/dict-type/index?page=1 或 /system/dict-type/17)
     * @returns 菜单实体
     */
    async getMenuByRouteUrl(url: string) {
        // 去除查询参数 ?page=1
        let purePath = url.split('?')[0];
        // 剥离首位斜杠统一格式
        if (purePath.startsWith('/')) {
            purePath = purePath.substring(1);
        }

        const pathsToTry = [purePath];
        
        // 尝试剥离子路径（例如操作 /index 或者查详情 /17）
        const parts = purePath.split('/');
        if (parts.length > 0) {
            const lastPart = parts[parts.length - 1];
            // 剥离末尾的数字 ID
            if (!isNaN(Number(lastPart))) {
                pathsToTry.push(parts.slice(0, -1).join('/'));
            }
            // 剥离默认的 index
            if (lastPart === 'index') {
                pathsToTry.push(parts.slice(0, -1).join('/'));
            }
        }

        // 优先根据路由提取匹配
        for (const p of pathsToTry) {
            if (!p) continue;
            // 因为 route 在数据库里多半是带斜杠开头或者不带斜杠开头，同时尝试查询
            const menu = await this.menuRepository.createQueryBuilder('menu')
                .where('menu.route = :p OR menu.route = :p2', { p: p, p2: '/' + p })
                .getOne();
            if (menu) return menu;
        }

        // 如果找不到 route，兜底原本的 code 查找逻辑
        return await this.menuRepository.findOne({ where: { code: url } });
    }

    /**
     * 根据Code精确查找菜单 (主要供权限和内部代码生成器等使用)
     * @param code 菜单路径/标识码
     * @returns 菜单实体
     */
    async getMenuByPath(code: string) {
        return await this.menuRepository.findOne({ where: { code: code } });
    }

    /**
     * 根据ID获取菜单
     * @param id 菜单ID
     * @returns 菜单实体
     */

    /**
     * 创建菜单
     */
    async create(data: Partial<MenuEntity>): Promise<MenuEntity> {
        const result = await super.create(data);
        await this.clearMenuRelatedUsersCache(); // 新增菜单会影响超管动态获取所有菜单
        await this.clearGlobalMenuCache();
        return result as MenuEntity;
    }

    /**
     * 更新菜单
     */
    async update(id: any, data: Partial<MenuEntity>): Promise<MenuEntity | null> {
        // 先清理关联用户的缓存
        await this.clearMenuRelatedUsersCache(id);
        await this.clearGlobalMenuCache()

        const result = await super.update(id, data);
        await this.clearGlobalMenuCache();
        return result as MenuEntity | null;
    }

    /**
     * 删除菜单
     */
    async remove(id: any): Promise<void> {

        // 判断是否关联了角色
        const menu = await this.menuRepository.findOne({ where: { id }, relations: ['roles'] });
        if (menu && menu.roles && menu.roles.length > 0) {
            throw new ApiException(400, '该菜单已关联角色，无法删除');
        }

        // 先清理关联用户的缓存
        await this.clearMenuRelatedUsersCache(id);
        await this.clearGlobalMenuCache()
        await super.remove(id);
    }

    /**
     * 通过ID获取菜单详情
     */
    async getMenuById(id: number) {
        return await this.menuRepository.findOne({ where: { id } });
    }

    /**
     * 创建菜单
     */
    async createMenu(menuDto: MenuDto) {
        return await this.menuRepository.save(menuDto);
    }

    /**
     * 根据父菜单ID获取菜单
     * @param parentId 父菜单ID
     * @returns 菜单实体
     */
    async getMenusByParentId(parentId: number) {
        return await this.menuRepository.find({ where: { parentId } });
    }

    /**
     * 获取扁平化的菜单列表 (供内部使用)
     */
    private async getFlatMenusByUserId(userId: number): Promise<MenuEntity[]> {
        let menus: MenuEntity[] = [];

        const roleIds = await this.userService.getRoleIdsByUserId(userId);

        if (!roleIds || roleIds.length === 0) {
            return [];
        }

        // 3. 根据roles获取所有的menus，并且状态必须为 1(正常)
        menus = await this.menuRepository.createQueryBuilder('menu')
            .innerJoin('menu.roles', 'role')
            .where('role.id IN (:...roleIds)', { roleIds })
            .andWhere('menu.status = :status', { status: 1 })
            .orderBy('menu.sort', 'ASC')
            .addOrderBy('menu.createTime', 'ASC')
            .getMany();

        // 4. 用户若有多个角色，相同的菜单会被查出多次，需要去重
        // 根据 menu.id 进行 map 去重
        const uniqueMap = new Map<number, MenuEntity>();
        menus.forEach(menu => uniqueMap.set(menu.id, menu));
        menus = Array.from(uniqueMap.values());

        // 重新按 sort 和 createTime 排序（因为被 Map 丢了原来的顺序）
        // menus.sort((a, b) => {
        //     if (a.sort === b.sort) {
        //         return Number(a.createTime) - Number(b.createTime);
        //     }
        //     return b.sort - a.sort;
        // });
        return menus;
    }

    /**
     * 获取权限的菜单
     */
    async getPermissionsMenu(userId: number) {
        const userInfo = await this.userService.read(userId);

        if (userInfo && (userInfo.roles as any).includes(1)) {
            let menus = await this.getAllMenu();
            menus.map((item) => {
                if (item.code === "dashboard") {
                    item.component = "system/work/index"
                }
            })
            return this.arrayToTree(menus);
        }

        let menus = await this.getFlatMenusByUserId(userId);
        let homeIndexComponent = userInfo?.dashboard === 'statistics' ? 'statistics/index' : 'work/index';

        menus.map((item) => {
            console.log(item.code === "dashboard")
            if (item.code === "dashboard") {
                console.log("you")
                item.component = homeIndexComponent
            }
        })
        // 5. 构建树形结构
        return this.arrayToTree(menus);
    }

    /**
     * 获取所有权限的菜单
     */
    async getAllMenu() {
        let menus = await this.menuRepository.createQueryBuilder('menu')
            .where('menu.status = :status', { status: 1 })
            .orderBy('menu.sort', 'DESC')
            .getMany();
        const uniqueMap = new Map<number, MenuEntity>();
        menus.forEach(menu => uniqueMap.set(menu.id, menu));
        menus = Array.from(uniqueMap.values());

        // 重新按 sort 和 createTime 排序（因为被 Map 丢了原来的顺序）
        // menus.sort((a, b) => {
        //     if (a.sort === b.sort) {
        //         return Number(a.createTime) - Number(b.createTime);
        //     }
        //     return b.sort - a.sort;
        // });

        return menus
    }

    /**
     * 获取当前用户的所有的菜单权限标志 (code)
     */
    async getCodes(userId: number): Promise<string[]> {

        const menus = await this.getFlatMenusByUserId(userId);
        // 过滤空值，去除重复值，只保留有合法 code 的集合
        return Array.from(new Set(menus.map(m => m.code).filter(Boolean)));
    }

    /**
     * 获取所有权限的菜单
     */
    async getAllCodes() {
        const menus = await this.getAllMenu();
        // console.log(menus)
        return Array.from(new Set(menus.map(m => m.code).filter(Boolean)));
    }

    /**
     * 根据角色ID获取该角色拥有的菜单ID列表
     */
    async getMenuIdsByRoleId(roleId: number): Promise<number[]> {
        const menus = await this.menuRepository.createQueryBuilder('menu')
            .innerJoin('menu.roles', 'role')
            .where('role.id = :roleId', { roleId })
            .select('menu.id')
            .getMany();
        return menus.map(m => m.id);
    }

    /**
     * 数组转树形结构
     */
    public arrayToTree(list: MenuEntity[]) {
        const result: any[] = [];
        const map = new Map<number, any>();

        list.forEach(item => {
            map.set(item.id, { ...item, children: [] });
        });

        list.forEach(item => {
            const node = map.get(item.id);
            if (item.parentId && map.has(item.parentId)) {
                map.get(item.parentId).children.push(node);
            } else {
                result.push(node);
            }
        });

        return result;
    }
}
