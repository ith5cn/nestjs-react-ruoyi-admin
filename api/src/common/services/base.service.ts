import { Inject, Injectable } from '@nestjs/common';
import { DeepPartial, FindManyOptions, FindOptionsWhere, Repository, ObjectLiteral, Like, In, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { RequestContextService } from '@/core/context/request-context.service';
import { RedisService } from '@/core/redis/redis.service';
import { ApiException } from '../exceptions/api.exception';
import { UserEntity } from '@/system/user/entities/user.entity';

@Injectable()
export class BaseService<T extends ObjectLiteral> {
    @Inject(RequestContextService)
    protected readonly requestContext: RequestContextService;
    @Inject(RedisService)
    protected readonly redisService: RedisService;
    @InjectDataSource()
    protected readonly systemDataSource: DataSource;
    constructor(private readonly repository: Repository<T>) { }

    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async findAll(): Promise<T[]> {
        return await this.repository.find();
    }

    async read(id: any): Promise<T | null> {
        return await this.repository.findOneBy({ id } as FindOptionsWhere<T>);
    }

    async update(id: any, data: DeepPartial<T>): Promise<T | null> {
        await this.repository.update(id, data as any);
        return await this.read(id);
    }

    async remove(id: any): Promise<void> {
        await this.repository.delete(id);
    }

    


    async getList(
        page: number,
        size: number,
        options?: FindManyOptions<T>,
    ): Promise<{ data: T[]; total: number }> {
        const [data, total] = await this.repository.findAndCount({
            ...options,
            skip: (page - 1) * size,
            take: size,
        });
        return { data, total };
    }

    async getAll(options?: FindManyOptions<T>): Promise<T[]> {
        return await this.repository.find(options);
    }

    buildWhere(query: any, config?: { likes?: string[], equals?: string[] }) {
        const where: any = {};
        const { likes = [], equals = [] } = config || { likes: [], equals: [] };

        likes.forEach(key => {
            if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
                where[key] = Like(`%${query[key]}%`);
            }
        });
        equals.forEach(key => {
            if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
                where[key] = query[key];
            }
        });
        return where;
    }

    /**
     * 获取当前请求的用户信息（从 AsyncLocalStorage 上下文中读取）
     */
    async getAdminInfo() {
        const userId = this.requestContext.getUser()?.id;
        if (!userId) {
            throw new ApiException('10001:用户不存在');
        }
        const cacheUser = await this.redisService.get(`system_user_info_${userId}`);
        if (cacheUser) {
            return JSON.parse(cacheUser);
        }
        return cacheUser;
    }

    /**
     * 获取可访问的
     */
    async getAccess() {
        const user = await this.getAdminInfo();
        if (user.roles.includes(1)) {
            // 超级管理员输出全部
            return await this.repository.find({ where: { status: 1 } as unknown as FindOptionsWhere<T> });
        } else {
            // 普通用户输出自己拥有的角色
            return await this.repository.find({ where: { status: 1, id: In(user.roles) } as unknown as FindOptionsWhere<T> });
        }
    }

    /**
     * 转换字段输出
     */
    async transformData(data: any[], fields: string[] = []) {
        if (fields.includes('authId')) {
            const authIds = [...new Set(data.map(item => item.authId).filter(Boolean))];
            if (authIds.length > 0) {
                const userRepo = this.systemDataSource.getRepository(UserEntity);
                const users = await userRepo.find({
                    where: { id: In(authIds) },
                    select: ['id', 'nickname', 'username'],
                });
                const userMap = new Map(users.map(u => [u.id, u.nickname || u.username]));
                data.forEach(item => {
                    item.authName = userMap.get(item.authId) || '';
                });
            }
        }
        return data;
    }
}

