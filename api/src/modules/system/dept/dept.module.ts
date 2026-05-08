import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptEntity } from './entities/dept.entity';
import { DeptService } from './dept.service';
import { DeptController } from './dept.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DeptEntity])],
    controllers: [DeptController],
    providers: [DeptService],
    exports: [DeptService],
})
export class DeptModule { }