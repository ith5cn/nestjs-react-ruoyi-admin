import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private readonly configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get<string>('redis.host'),
            port: this.configService.get<number>('redis.port'),
            password: this.configService.get<string>('redis.password'),
            db: this.configService.get<number>('redis.db'),
        });

        this.client.on('connect', () => {
            this.logger.log('Redis 连接成功');
        });

        this.client.on('error', (err) => {
            this.logger.error('Redis 连接错误', err);
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    /**
     * 获取原始 ioredis 客户端实例，用于高级操作
     */
    getClient(): Redis {
        return this.client;
    }

    // ==================== String 操作 ====================

    /**
     * 设置缓存
     * @param key    键
     * @param value  值
     * @param ttl    可选，过期时间（秒）
     */
    async set(key: string, value: string | number, ttl?: number): Promise<'OK'> {
        if (ttl) {
            return this.client.set(key, value, 'EX', ttl);
        }
        return this.client.set(key, value);
    }

    /**
     * 获取缓存
     */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /**
     * 删除一个或多个 key
     */
    async del(...keys: string[]): Promise<number> {
        return this.client.del(...keys);
    }

    /**
     * 判断 key 是否存在
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    /**
     * 设置过期时间（秒）
     */
    async expire(key: string, ttl: number): Promise<boolean> {
        const result = await this.client.expire(key, ttl);
        return result === 1;
    }

    /**
     * 获取 key 剩余过期时间（秒），-1 表示永不过期，-2 表示 key 不存在
     */
    async ttl(key: string): Promise<number> {
        return this.client.ttl(key);
    }

    /**
     * 自增
     */
    async incr(key: string): Promise<number> {
        return this.client.incr(key);
    }

    /**
     * 自减
     */
    async decr(key: string): Promise<number> {
        return this.client.decr(key);
    }

    // ==================== Hash 操作 ====================

    /**
     * Hash 设置字段
     */
    async hset(key: string, field: string, value: string | number): Promise<number> {
        return this.client.hset(key, field, value);
    }

    /**
     * Hash 获取字段
     */
    async hget(key: string, field: string): Promise<string | null> {
        return this.client.hget(key, field);
    }

    /**
     * 获取整个 Hash
     */
    async hgetall(key: string): Promise<Record<string, string>> {
        return this.client.hgetall(key);
    }

    /**
     * Hash 删除一个或多个字段
     */
    async hdel(key: string, ...fields: string[]): Promise<number> {
        return this.client.hdel(key, ...fields);
    }

    // ==================== Set 操作 ====================

    /**
     * Set 添加成员
     */
    async sadd(key: string, ...members: (string | number)[]): Promise<number> {
        return this.client.sadd(key, ...members);
    }

    /**
     * 获取 Set 所有成员
     */
    async smembers(key: string): Promise<string[]> {
        return this.client.smembers(key);
    }

    /**
     * 判断是否是 Set 成员
     */
    async sismember(key: string, member: string | number): Promise<boolean> {
        const result = await this.client.sismember(key, member);
        return result === 1;
    }

    /**
     * Set 移除成员
     */
    async srem(key: string, ...members: (string | number)[]): Promise<number> {
        return this.client.srem(key, ...members);
    }

    // ==================== List 操作 ====================

    /**
     * List 左侧推入
     */
    async lpush(key: string, ...values: (string | number)[]): Promise<number> {
        return this.client.lpush(key, ...values);
    }

    /**
     * List 右侧推入
     */
    async rpush(key: string, ...values: (string | number)[]): Promise<number> {
        return this.client.rpush(key, ...values);
    }

    /**
     * List 左侧弹出
     */
    async lpop(key: string): Promise<string | null> {
        return this.client.lpop(key);
    }

    /**
     * List 右侧弹出
     */
    async rpop(key: string): Promise<string | null> {
        return this.client.rpop(key);
    }

    /**
     * 获取 List 指定范围的元素
     */
    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return this.client.lrange(key, start, stop);
    }

    /**
     * 获取 List 长度
     */
    async llen(key: string): Promise<number> {
        return this.client.llen(key);
    }

    // ==================== 工具方法 ====================

    /**
     * 按模式搜索 key（生产环境慎用）
     */
    async keys(pattern: string): Promise<string[]> {
        return this.client.keys(pattern);
    }
}
