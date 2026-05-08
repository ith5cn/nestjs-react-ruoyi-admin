import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { LoggerService } from "./core/logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);
  app.useStaticAssets(join(process.cwd(), "runtime", "uploads"), {
    prefix: "/uploads/",
  });

  await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();
