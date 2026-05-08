import * as Joi from 'joi';

export const REDIS_SCHEME = {
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    REDIS_PASSWORD: Joi.string().required(),
    REDIS_DB: Joi.number().required(),
}
