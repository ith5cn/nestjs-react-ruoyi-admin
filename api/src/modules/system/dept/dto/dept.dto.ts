import { z } from 'zod';
import { ZodDto } from '@/core/decorators/zod-dto.decorator'


export const deptSchema = z.object({
    parent_id: z.number().optional(),
    name: z.string().min(1, '部门名称不能为空'),
    status: z.number().optional(),
    sort: z.number().optional(),
    remark: z.string().optional(),
})

@ZodDto(deptSchema)
export class DeptDto {
    parent_id?: number
    name: string
    status?: number
    sort?: number
    remark?: string
}