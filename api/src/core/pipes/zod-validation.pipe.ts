import {
    PipeTransform,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import type { ArgumentMetadata } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZOD_SCHEMA_KEY } from '../decorators/zod-dto.decorator';

/**
 * 全局 Zod 校验 Pipe
 *
 * 自动从 DTO 类的 metadata 中读取 ZodSchema 进行校验，
 * 配合 @ZodDto 装饰器使用。
 *
 * @example
 * // 1. 定义 DTO
 * @ZodDto(CreateUserSchema)
 * export class CreateUserDto {
 *   name: string;
 * }
 *
 * // 2. Controller 中直接使用，无需额外装饰器
 * @Post()
 * create(@Body() data: CreateUserDto) {}
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // 仅校验 body 类型参数
        if (metadata.type !== 'body') {
            return value;
        }

        // 从 DTO 类的 metadata 中获取绑定的 ZodSchema
        const metatype = metadata.metatype;
        if (!metatype) {
            return value;
        }

        const schema: ZodSchema | undefined = Reflect.getMetadata(
            ZOD_SCHEMA_KEY,
            metatype,
        );

        // 如果 DTO 没有绑定 ZodSchema，直接放行
        if (!schema) {
            return value;
        }

        const result = schema.safeParse(value);
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));

            throw new BadRequestException({
                message: '参数校验失败',
                errors,
            });
        }

        return result.data;
    }
}
