import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { RoleEntity } from "./entities/role.entity";
import { BaseService } from "@/common/services/base.service";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { MenuService } from "../menu/menu.service";
import { ApiException } from "@/common/exceptions/api.exception";
import { RedisService } from "@/core/redis/redis.service";

@Injectable()

export class RoleService extends BaseService<RoleEntity> {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @Inject(forwardRef(() => MenuService))
        private readonly menuService: MenuService,
        protected readonly redisService: RedisService,
    ) { super(roleRepository); }

    /**
     * 绑定菜单
     */
    async bindMenu(id: number, data: { ids: number[] }) {
        const menus = await this.menuService.getAll({ where: { id: In(data.ids) } });
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['users']
        });
        if (!role) {
            throw new ApiException('10001:角色不存在');
        }
        role.menus = menus;
        const result = await this.roleRepository.save(role);

        // 获取绑定了该角色的所有用户ID并清除缓存，这样前端下次请求时就会重建缓存
        if (role.users && role.users.length > 0) {
            const cacheKeys = role.users.map(user => `system_user_info_${user.id}`);
            if (cacheKeys.length > 0) {
                await this.redisService.del(...cacheKeys);
            }
        }

        return result;
    }


}