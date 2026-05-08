import * as Joi from 'joi';

export const DATABASE_SCHEME = {
    DB_TYPE: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_SYSTEM_DATABASE: Joi.string().required(),
};