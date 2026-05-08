import * as Joi from 'joi';
import { DATABASE_SCHEME } from './config/database/database.schema';
import { REDIS_SCHEME } from './config/redis/redis.schema';
import { JWT_SCHEME } from './config/jwt/jwt.schema';

const envConfigValidationSchema = Joi.object({
    ...DATABASE_SCHEME,
    ...REDIS_SCHEME,
    ...JWT_SCHEME,
    DEMO_MODEL: Joi.boolean().default(false),
    DEMO_MODE: Joi.boolean().default(false),
});

export default envConfigValidationSchema
