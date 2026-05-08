import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/services/base.service';
import { DictTypeEntity } from '../entities/dict-type.entity';

@Injectable()
export class DictTypeService extends BaseService<DictTypeEntity> {
    constructor(
        @InjectRepository(DictTypeEntity)
        private readonly dictTypeRepository: Repository<DictTypeEntity>,
    ) {
        super(dictTypeRepository);
    }
}
