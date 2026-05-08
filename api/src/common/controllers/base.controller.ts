import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BaseService } from '../services/base.service';
import { ObjectLiteral } from 'typeorm';
import type { DeepPartial } from 'typeorm';
import { BypassEncryption } from '../decorators/bypass-encryption.decorator';
import { ApiException } from '../exceptions/api.exception';

export abstract class BaseController<T extends ObjectLiteral> {
    constructor(private readonly service: BaseService<T>) { }

    @Post()
    async create(@Body() data: DeepPartial<T>) {
        return await this.service.create(data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        if (!id) {
            throw new ApiException('ID不能为空');
        }
        const entity = await this.service.read(id);
        if (!entity) {
            throw new ApiException('数据不存在');
        }
        return await this.service.remove(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: DeepPartial<T>) {
        if (!id) {
            throw new ApiException('ID不能为空');
        }
        const entity = await this.service.read(id);
        if (!entity) {
            throw new ApiException('数据不存在');
        }
        return await this.service.update(id, data);
    }

}
