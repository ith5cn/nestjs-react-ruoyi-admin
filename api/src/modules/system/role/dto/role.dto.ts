import { z } from 'zod';
import { ZodDto } from '@/core/decorators/zod-dto.decorator'

export const RoleSchema = z.object({
    parent_id: z.number(),
    name: z.string().min(1, '角色名称不能为空'),
    code: z.string().min(1, '角色编码不能为空'),
    sort: z.number().min(1, '角色排序不能为空'),
    status: z.number().min(1, '角色状态不能为空'),
    remark: z.string().optional(),
})

@ZodDto(RoleSchema)
export class RoleDto {
    parent_id: number
    name: string
    code: string
    sort: number
    status: number
    remark?: string
}