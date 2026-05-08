import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { SystemModule } from './modules/system/system.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { JwtSystemAccessGuard } from './modules/auth/guards/system/jwt.guard';
import { PermissionGuard } from './modules/auth/guards/system/permission.guard';
import { DemoModeGuard } from './common/guards/demo-mode.guard';


import { ScheduleModule } from '@nestjs/schedule';
import { MenuModule } from './modules/system/menu/menu.module';
import { UserModule } from './modules/system/user/user.module';
@Module({
  imports: [CoreModule, SystemModule, MenuModule, UserModule, ScheduleModule.forRoot(), EventEmitterModule.forRoot({
    wildcard: true,
    delimiter: '.',
  })],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: DemoModeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtSystemAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    }
  ]
})
export class AppModule { }
