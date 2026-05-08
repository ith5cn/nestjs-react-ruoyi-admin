import { z } from 'zod';
import { ZodDto } from '@/core/decorators/zod-dto.decorator'

export const MenuSchema = z.object({
    parentId: z.number().nullish(),
    name: z.string().min(1, '菜单名称不能为空'),
    type: z.string().min(1, '菜单类型不能为空'),
    icon: z.string().nullish(),
    code: z.string().min(1, '菜单编码不能为空'),
    route: z.string().nullish(),
    component: z.string().nullish(),
    sort: z.number().min(1, '菜单排序不能为空'),
    isHidden: z.number().nullish(),
    isLayout: z.number().nullish(),
    status: z.number().min(1, '菜单状态不能为空'),
    level: z.string().nullish(),
    remark: z.string().nullish(),
}).superRefine((data, ctx) => {
    if (data.type !== 'B') {
        if (!data.icon) {
            ctx.addIssue({
                code: 'custom',
                message: '菜单图标不能为空',
                path: ['icon'],
            });
        }
    }
})


@ZodDto(MenuSchema)
export class MenuDto {
    name: string
    type: string
    icon?: string
    code: string
    route?: string
    component?: string
    sort: number
    isHidden: number
    isLayout: number
    status: number
    remark?: string
    parentId?: number
    level?: string
}

