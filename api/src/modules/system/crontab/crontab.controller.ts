import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { BaseController } from "@/common/controllers/base.controller";
import { CrontabEntity } from "./entities/crontab.entity";
import { CrontabService } from "./services/crontab.service";
import { CrontabRunnerService } from "./services/crontab-runner.service";
import { ApiException } from "@/common/exceptions/api.exception";
import type { DeepPartial } from "typeorm";
import { INTERNAL_TASKS } from "./constants/internal-task.constants";
import { CrontabLogService } from "./services/crontab-log.service";

@Controller('system/crontab')
export default class CrontabController extends BaseController<CrontabEntity> {
    constructor(
        private readonly crontabService: CrontabService,
        private readonly crontabRunnerService: CrontabRunnerService,
        private readonly crontabLogService: CrontabLogService,
    ) {
        super(crontabService);
    }

    @Get('index')
    async index(@Query() query: any) {
        let { page = 1, limit = 10, size, ...options } = query;
        const pageSize = Number(size || limit);
        const pageNum = Number(page);
        const where = this.crontabService.buildWhere(options, {
            equals: ['status', 'name'],
        });
        const order: any = { id: 'ASC' };
        return this.crontabService.getList(pageNum, pageSize, { where, order });
    }

    @Get('internal-tasks')
    async internalTasks() {
        return INTERNAL_TASKS;
    }

    @Get('log/index')
    async logIndex(@Query() query: any) {
        let { page = 1, limit = 10, size, ...options } = query;
        const pageSize = Number(size || limit);
        const pageNum = Number(page);
        const where = this.crontabLogService.buildWhere(options, {
            equals: ['crontabId', 'status', 'triggerType'],
            likes: ['name', 'target'],
        });
        const order: any = { id: 'DESC' };
        return this.crontabLogService.getList(pageNum, pageSize, { where, order });
    }

    @Post()
    async create(@Body() data: DeepPartial<CrontabEntity>) {
        const id = await this.crontabService.create(data);
        const entity = await this.crontabService.read(id as unknown as string);
        if (entity && Number(entity.status) === 1) {
            this.crontabRunnerService.addCronJob(entity);
        }
        return id;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: DeepPartial<CrontabEntity>) {
        const result = await super.update(id, data);
        const entity = await this.crontabService.read(id);
        if (entity) {
            if (Number(entity.status) === 1) {
                this.crontabRunnerService.addCronJob(entity);
            } else {
                this.crontabRunnerService.deleteCronJob(entity.id);
            }
        }
        return result;
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const result = await super.delete(id);
        this.crontabRunnerService.deleteCronJob(id);
        return result;
    }

    @Post('run/:id')
    async runOnce(@Param('id') id: string) {
        const entity = await this.crontabService.read(id);
        if (!entity) {
            throw new ApiException('任务不存在');
        }
        this.crontabRunnerService.executeTask(entity, 2);
        return '任务已触发执行，请查看任务日志';
    }
}
