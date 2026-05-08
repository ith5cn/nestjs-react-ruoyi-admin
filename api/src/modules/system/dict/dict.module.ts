import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictTypeEntity } from './entities/dict-type.entity';
import { DictTypeService } from './services/dict-type.service';
import { DictTypeController } from './controller/dict-type.controller';
import { DictDataEntity } from './entities/dict-data.entity';
import { DictDataService } from './services/dict-data.service';
import { DictDataController } from './controller/dict-data.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DictTypeEntity, DictDataEntity])],
    providers: [DictTypeService, DictDataService],
    controllers: [DictTypeController, DictDataController],
    exports: [DictTypeService, DictDataService],
})
export class DictModule { }