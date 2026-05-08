import type { ZodSchema } from 'zod';

export const ZOD_SCHEMA_KEY = 'ZOD_SCHEMA';

/**
 * 将 Zod Schema 绑定到 DTO 类上
 *
 * 全局 ZodValidationPipe 会自动读取该 metadata 进行校验
 *
 * @example
 * import { z } from 'zod';
 *
 * export const CreateUserSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * @ZodDto(CreateUserSchema)
 * export class CreateUserDto {
 *   name: string;
 *   email: string;
 * }
 *
 * // Controller 中直接使用，无需额外装饰器：
 * @Post()
 * create(@Body() data: CreateUserDto) {}
 */
export function ZodDto(schema: ZodSchema): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(ZOD_SCHEMA_KEY, schema, target);
    };
}
