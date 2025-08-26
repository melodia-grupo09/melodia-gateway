import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/postgresql';
import { ExceptionFilter } from './framework/filters/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.useGlobalFilters(new ExceptionFilter());
  const mikroORM: MikroORM = app.get(MikroORM);
  await mikroORM.checkConnection();
  await mikroORM.migrator.up();
  await app.listen(process.env.PORT ?? 3000);
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
