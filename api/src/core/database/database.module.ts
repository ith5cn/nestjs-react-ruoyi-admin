import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

const isProduction = (configService: ConfigService) =>
    configService.get<string>('NODE_ENV') === 'production';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.get<any>('database.type') || 'mysql',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.database'),
                autoLoadEntities: true,
                synchronize: !isProduction(configService),
            }),
        }),
        TypeOrmModule.forRootAsync({
            name: 'db_center',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.get<any>('database.type') || 'mysql',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: 'db_center', // 第二个库强绑定库名
                autoLoadEntities: true,
                synchronize: false,
            }),
        }),
    ],
    providers: [],
    exports: [TypeOrmModule]
})
export class DatabaseModule { }
