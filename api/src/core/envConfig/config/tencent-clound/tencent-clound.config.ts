import { registerAs } from "@nestjs/config";

export default registerAs('tencentCloud', () => ({
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
    region: process.env.TENCENT_REGION,
    bucket: process.env.TENCENT_BUCKET,
}))
