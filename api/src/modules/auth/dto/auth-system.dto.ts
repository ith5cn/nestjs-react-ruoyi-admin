import { ZodDto } from '@/core/decorators/zod-dto.decorator'
import { z } from 'zod'

export const AuthSystemLoginSchema = z.object({
    username: z.string().min(1, '用户名不能为空'),
    password: z.string().min(1, '密码不能为空'),
})

@ZodDto(AuthSystemLoginSchema)
export class AuthSystemLoginDto {
    username: string
    password: string
}


export const AuthSystemRegisterSchema = z.object({
    username: z.string().min(2, '用户名不能少于2位').max(20, '用户名不能超过20位'),
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(6, '密码不能为空').max(20, '密码不能超过20位'),
    nickname: z.string().max(30, '用户昵称不能超过30位').optional(),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确').optional(),
})
@ZodDto(AuthSystemRegisterSchema)
export class AuthSystemRegisterDto {
    username: string
    email: string
    password: string
    nickname?: string
    phone?: string
}

export const AuthSystemRefreshTokenSchema = z.object({
    refreshToken: z.string().min(1, '刷新令牌不能为空'),
})

@ZodDto(AuthSystemRefreshTokenSchema)
export class AuthSystemRefreshTokenDto {
    refreshToken: string
}