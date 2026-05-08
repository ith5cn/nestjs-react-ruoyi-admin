import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/services/base.service';
import { DictDataEntity } from '../entities/dict-data.entity';
import { DictTypeEntity } from '../entities/dict-type.entity';

@Injectable()
export class DictDataService extends BaseService<DictDataEntity> {
    constructor(
        @InjectRepository(DictDataEntity)
        private readonly dictDataRepository: Repository<DictDataEntity>,
        @InjectRepository(DictTypeEntity)
        private readonly dictTypeRepository: Repository<DictTypeEntity>,
    ) {
        super(dictDataRepository);
    }

    async getdictAll(): Promise<Record<string, DictDataEntity[]>> {
        const types = await this.dictTypeRepository.find({ where: { status: 1 } });

        const dataList = await this.dictDataRepository.find({
            where: { status: 1 },
            order: { sort: 'ASC' },
        });
        console.log("dataList", dataList)
        const typeMap = new Map(types.map(t => [t.id, t.code]));

        const result: Record<string, DictDataEntity[]> = {};
        for (const item of dataList) {
            const typeCode = typeMap.get(item.typeId);
            if (!typeCode) continue;
            if (!result[typeCode]) result[typeCode] = [];
            result[typeCode].push(item);
        }
        return result;
    }
}
