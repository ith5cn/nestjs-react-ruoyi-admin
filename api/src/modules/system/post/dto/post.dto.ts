import { z } from 'zod';
import { ZodDto } from '@/core/decorators/zod-dto.decorator'

export const PostSchema = z.object({
    name: z.string().min(1, '岗位名称不能为空'),
    code: z.string().min(1, '岗位编码不能为空'),
    sort: z.number().min(0, '排序不能为空'),
    status: z.number().min(1, '状态不能为空'),
    remark: z.string().optional(),
})

@ZodDto(PostSchema)
export class PostDto {
    name: string
    code: string
    sort: number
    status: number
    remark?: string
}
