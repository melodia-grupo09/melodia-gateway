import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/postgresql';
import { ExceptionFilter } from './framework/filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.useGlobalFilters(new ExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
  const mikroORM: MikroORM = app.get(MikroORM);
  await mikroORM.checkConnection();
  await mikroORM.migrator.up();
  await app.listen(process.env.NODE_PORT ?? 3000);
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
