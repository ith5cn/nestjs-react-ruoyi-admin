import { registerAs } from "@nestjs/config";

export default registerAs('security', () => ({
    systemSecret: process.env.SYSTEM_SECRET,
    systemExpiresIn: process.env.SYSTEM_EXPIRES_IN,
    systemRefreshSecret: process.env.SYSTEM_REFRESH_SECRET,
    systemRefreshExpiresIn: process.env.SYSTEM_REFRESH_EXPIRES_IN,
    refreshDisable: process.env.REFRESH_DISABLE,
    singleDeviceLogin: process.env.SINGLE_DEVICE_LOGIN,
    cacheTokenPrefix: process.env.CACHE_TOKEN_PREFIX,
    refreshCacheTokenPrefix: process.env.REFRESH_CACHE_TOKEN_PREFIX,
}))