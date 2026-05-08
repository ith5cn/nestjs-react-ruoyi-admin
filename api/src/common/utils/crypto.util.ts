import * as crypto from 'crypto';

export class CryptoUtil {
    private static readonly ALGORITHM = 'aes-256-cbc';

    private static get KEY() { return process.env.CRYPTO_AES_KEY || ''; }
    private static get IV() { return process.env.CRYPTO_AES_IV || ''; }
    private static get SIGN_SECRET() { return process.env.CRYPTO_SIGN_SECRET || ''; }

    /**
     * 加密数据
     * @param data 需要加密的数据 (对象或字符串)
     * @returns 加密后的十六进制字符串
     */
    static encrypt(data: any): string {
        if (!this.KEY || !this.IV) {
            throw new Error('Missing encryption key or IV');
        }

        const text = typeof data === 'string' ? data : JSON.stringify(data);
        const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.KEY), Buffer.from(this.IV));
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * 解密数据
     * @param encryptedText 加密后的十六进制字符串
     * @returns 解密后的数据 (尝试解析为JSON，失败则返回字符串)
     */
    static decrypt(encryptedText: string): any {
        if (!this.KEY || !this.IV) {
            throw new Error('Missing encryption key or IV');
        }

        const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(this.KEY), Buffer.from(this.IV));
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    }

    /**
     * 生成签名
     * @param data 需要签名的数据
     * @returns 签名字符串 (Hex)
     */
    static sign(data: any): string {
        if (!this.SIGN_SECRET) {
            throw new Error('Missing sign secret');
        }

        const text = typeof data === 'string' ? data : JSON.stringify(data);
        // 对排序后的key进行签名，保证一致性 (如果是对象)
        const sortedText = typeof data === 'object' && data !== null
            ? JSON.stringify(this.sortObject(data))
            : text;

        const hmac = crypto.createHmac('sha256', this.SIGN_SECRET);
        hmac.update(sortedText);
        return hmac.digest('hex');
    }

    /**
     * 验证签名
     * @param data 数据
     * @param signature 签名
     */
    static verify(data: any, signature: string): boolean {
        const expectedSignature = this.sign(data);
        return expectedSignature === signature;
    }

    /**
     *递归对对象Key进行排序
     */
    private static sortObject(obj: any): any {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
            return obj;
        }
        return Object.keys(obj).sort().reduce((result, key) => {
            result[key] = this.sortObject(obj[key]);
            return result;
        }, {});
    }
}
