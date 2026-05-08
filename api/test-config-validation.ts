
import * as Joi from 'joi';
import { REDIS_SCHEME } from './src/core/envConfig/config/redis/redis.schema';

const mockEnv = {
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: 'password',
    REDIS_DB: 0
};

const schema = Joi.object(REDIS_SCHEME);
const { error } = schema.validate(mockEnv, { abortEarly: false, allowUnknown: true });

if (error) {
    console.error('Validation failed:', error.message);
    process.exit(1);
} else {
    console.log('Validation successful!');
}
