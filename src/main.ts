import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/postgresql';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const mikroORM: MikroORM = app.get(MikroORM);
  await mikroORM.checkConnection();
  await mikroORM.migrator.up();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
