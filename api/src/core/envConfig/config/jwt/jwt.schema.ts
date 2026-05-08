import * as Joi from 'joi';

export const JWT_SCHEME = {
    SYSTEM_SECRET: Joi.string().required(),
    SYSTEM_EXPIRES_IN: Joi.string().required(),
    REFRESH_DISABLE: Joi.boolean().required(),
    SINGLE_DEVICE_LOGIN: Joi.boolean().required(),
}