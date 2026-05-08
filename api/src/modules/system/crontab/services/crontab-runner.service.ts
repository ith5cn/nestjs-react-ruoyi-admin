import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { DiscoveryService } from "@nestjs/core";
import { HttpService } from "@nestjs/axios";
import { CronJob } from "cron";
import { CrontabEntity } from "../entities/crontab.entity";
import { CrontabLogEntity } from "../entities/crontab-log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CrontabRunnerService implements OnApplicationBootstrap {
    private readonly logger = new Logger(CrontabRunnerService.name);
    private readonly runningTasks = new Set<string>();

    constructor(
        @InjectRepository(CrontabEntity)
        private readonly crontabRepository: Repository<CrontabEntity>,
        @InjectRepository(CrontabLogEntity)
        private readonly crontabLogRepository: Repository<CrontabLogEntity>,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly discoveryService: DiscoveryService,
        private readonly httpService: HttpService,
    ) {}

    async onApplicationBootstrap() {
        this.logger.log('Init crontab tasks...');
        const tasks = await this.crontabRepository.find({
            where: { status: 1 },
        });

        for (const task of tasks) {
            this.addCronJob(task);
        }
    }

    addCronJob(task: CrontabEntity) {
        try {
            this.deleteCronJob(task.id.toString());

            const job = new CronJob(task.rule, async () => {
                await this.executeTask(task, 1);
            });

            this.schedulerRegistry.addCronJob(task.id.toString(), job);
            job.start();
            this.logger.log(`Task [${task.name} - ID:${task.id}] scheduled with rule: ${task.rule}`);
        } catch (e: any) {
            this.logger.error(`Failed to schedule task [${task.name} - ID:${task.id}]: ${e.message}`);
        }
    }

    deleteCronJob(id: string | number) {
        const strId = id.toString();
        if (this.schedulerRegistry.doesExist('cron', strId)) {
            const job = this.schedulerRegistry.getCronJob(strId);
            job.stop();
            this.schedulerRegistry.deleteCronJob(strId);
            this.logger.log(`Task ID:${strId} stopped and removed from scheduler.`);
        }
    }

    async executeTask(task: CrontabEntity, triggerType = 1) {
        const taskId = task.id.toString();
        let logEntity: CrontabLogEntity | null = null;
        const startAt = Date.now();
        const startTime = this.toDateTimeString(new Date());

        if (Number(task.singleton) === 1) {
            if (this.runningTasks.has(taskId)) {
                this.logger.warn(`Task [${task.name} - ID:${task.id}] is singleton and currently running. Skipped.`);
                await this.writeSkipLog(task, triggerType, 'Task skipped because a previous run is still in progress.');
                return;
            }
            this.runningTasks.add(taskId);
        }

        try {
            logEntity = await this.crontabLogRepository.save(this.crontabLogRepository.create({
                crontabId: task.id,
                name: task.name,
                target: task.target,
                parameter: task.parameter,
                triggerType,
                status: 0,
                startTime,
            }));

            this.logger.log(`Executing task [${task.name} - ID:${task.id}]`);
            const paramObj = task.parameter ? JSON.parse(task.parameter) : null;
            let result: any = null;

            // taskStyle: 1=系统内部任务, 2=HTTP请求任务
            // null/undefined 视为系统内部任务（兼容老数据）
            const style = Number(task.taskStyle) || 1;
            if (style === 1) {
                result = await this.executeSystemTask(task.target, paramObj);
            } else if (style === 2) {
                result = await this.executeHttpTask(task.target, paramObj);
            } else {
                throw new Error(`Unknown taskStyle: ${task.taskStyle}`);
            }

            await this.finishLog(logEntity, {
                status: 1,
                resultInfo: this.buildResultInfo(result),
                startAt,
            });
            this.logger.log(`Task [${task.name} - ID:${task.id}] executed successfully`);
        } catch (error: any) {
            await this.finishLog(logEntity, {
                status: 2,
                exceptionInfo: this.buildExceptionInfo(error),
                resultInfo: 'Task execution failed.',
                startAt,
            });
            this.logger.error(`Task [${task.name} - ID:${task.id}] failed: ${error.message}`, error.stack);
        } finally {
            if (Number(task.singleton) === 1) {
                this.runningTasks.delete(taskId);
            }
        }
    }

    private async executeSystemTask(target: string, params: any) {
        const [className, methodName] = target.split('.');
        if (!className || !methodName) {
            throw new Error(`Invalid target format: ${target}. Expected format: ClassName.methodName`);
        }

        const providers = this.discoveryService.getProviders();
        const provider = providers.find((p) => p.metatype?.name === className);

        if (!provider || !provider.instance) {
            throw new Error(`Service [${className}] not found in DI container.`);
        }

        const instance = provider.instance;
        if (typeof instance[methodName] !== 'function') {
            throw new Error(`Method [${methodName}] not found or not callable on [${className}].`);
        }

        return await instance[methodName](params);
    }

    private async executeHttpTask(url: string, params: any) {
        if (!url) {
            throw new Error('HTTP URL cannot be empty');
        }

        const config = params || {};
        return await firstValueFrom(this.httpService.post(url, config));
    }

    private async writeSkipLog(task: CrontabEntity, triggerType: number, reason: string) {
        const now = this.toDateTimeString(new Date());
        await this.crontabLogRepository.save(this.crontabLogRepository.create({
            crontabId: task.id,
            name: task.name,
            target: task.target,
            parameter: task.parameter,
            triggerType,
            status: 3,
            startTime: now,
            endTime: now,
            durationMs: 0,
            resultInfo: reason,
        }));
    }

    private async finishLog(
        logEntity: CrontabLogEntity | null,
        options: {
            status: number;
            resultInfo?: string;
            exceptionInfo?: string;
            startAt: number;
        },
    ) {
        if (!logEntity) {
            return;
        }

        logEntity.status = options.status;
        logEntity.resultInfo = options.resultInfo ?? '';
        logEntity.exceptionInfo = options.exceptionInfo ?? '';
        logEntity.endTime = this.toDateTimeString(new Date());
        logEntity.durationMs = Date.now() - options.startAt;
        await this.crontabLogRepository.save(logEntity);
    }

    private buildResultInfo(result: any) {
        if (result == null) {
            return 'Task executed successfully.';
        }

        try {
            const serialized = JSON.stringify(result);
            return serialized.length > 2000 ? `${serialized.slice(0, 2000)}...` : serialized;
        } catch {
            return String(result);
        }
    }

    private buildExceptionInfo(error: any) {
        const message = error?.stack || error?.message || String(error);
        return message.length > 4000 ? `${message.slice(0, 4000)}...` : message;
    }

    private toDateTimeString(date: Date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
}
