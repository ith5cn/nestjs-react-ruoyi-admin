import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/services/base.service';
import { DeptEntity } from './entities/dept.entity';
import { listToTree } from '@/common/utils/child.utils';

@Injectable()
export class DeptService extends BaseService<DeptEntity> {
    constructor(
        @InjectRepository(DeptEntity)
        private readonly deptRepository: Repository<DeptEntity>,
    ) {
        super(deptRepository);
    }

    /**
     * 可操作部门
     */
    async accessDept(where: any = {}) {
        const adminInfo = await this.getAdminInfo();
        // console.log(adminInfo)
        // todo筛选
        // const depts = adminInfo.depts;

        const { tree, ...queryWhere } = where;
        const query = this.deptRepository.createQueryBuilder('dept');
        if (tree) {
            query.select(['dept.id', 'dept.name', 'dept.parentId', 'dept.sort', 'dept.status', 'dept.level']);
        }
        query.orderBy('sort', 'DESC').addOrderBy('id', 'ASC');
        const data = await query.where(queryWhere).getMany();
        return listToTree(data);
    }
}
