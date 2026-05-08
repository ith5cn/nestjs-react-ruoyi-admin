import CryptoJS from 'crypto-js';

export class CryptoUtil {


    private static get KEY() { return import.meta.env.VITE_APP_CRYPTO_AES_KEY || ''; }
    private static get IV() { return import.meta.env.VITE_APP_CRYPTO_AES_IV || ''; }
    private static get SIGN_SECRET() { return import.meta.env.VITE_APP_CRYPTO_SIGN_SECRET || ''; }

    /**
     * 加密数据
     * @param data 需要加密的数据 (对象或字符串)
     * @returns 加密后的十六进制字符串
     */
    static encrypt(data: any): string {
        if (!this.KEY || !this.IV) {
            console.error('Missing encryption key or IV');
            return '';
        }

        const text = typeof data === 'string' ? data : JSON.stringify(data);
        const key = CryptoJS.enc.Utf8.parse(this.KEY);
        const iv = CryptoJS.enc.Utf8.parse(this.IV);

        const encrypted = CryptoJS.AES.encrypt(text, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    }

    /**
     * 解密数据
     * @param encryptedText 加密后的十六进制字符串
     * @returns 解密后的数据 (尝试解析为JSON，失败则返回字符串)
     */
    static decrypt(encryptedText: string): any {
        if (!this.KEY || !this.IV) {
            console.error('Missing encryption key or IV');
            return null;
        }

        const key = CryptoJS.enc.Utf8.parse(this.KEY);
        const iv = CryptoJS.enc.Utf8.parse(this.IV);
        const encryptedHex = CryptoJS.enc.Hex.parse(encryptedText);
        const encryptedBase64 = CryptoJS.enc.Base64.stringify(encryptedHex);

        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

        try {
            return JSON.parse(decryptedStr);
        } catch {
            return decryptedStr;
        }
    }

    /**
     * 生成签名
     * @param data 需要签名的数据
     * @returns 签名字符串 (Hex)
     */
    static sign(data: any): string {
        if (!this.SIGN_SECRET) {
            console.error('Missing sign secret');
            return '';
        }

        const text = typeof data === 'string' ? data : JSON.stringify(data);
        // 对排序后的key进行签名，保证一致性 (如果是对象)
        const sortedText = typeof data === 'object' && data !== null
            ? JSON.stringify(this.sortObject(data))
            : text;

        const hmac = CryptoJS.HmacSHA256(sortedText, this.SIGN_SECRET);
        return hmac.toString(CryptoJS.enc.Hex);
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
        return Object.keys(obj).sort().reduce((result: any, key) => {
            result[key] = this.sortObject(obj[key]);
            return result;
        }, {});
    }
}
