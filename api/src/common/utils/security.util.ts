import * as bcrypt from 'bcryptjs';

export class SecurityUtil {
    /**
     * 加密：用于用户注册或修改密码
     * @param password 明文密码
     */
    static async encryptPassword(password: string): Promise<string> {
        const saltRounds = 10; // 盐的强度，数值越高加密越慢越安全，10是平衡点
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * 对比：用于登录验证
     * @param password 前端传来的明文密码
     * @param hashedPassword 数据库中存储的加密哈希
     */
    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}