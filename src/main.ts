import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/postgresql';
import { ExceptionFilter } from './framework/filters/exception.filter';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  startSwaggerDocs(app);
  app.enableShutdownHooks();
  const mikroORM: MikroORM = app.get(MikroORM);
  await mikroORM.checkConnection();
  await mikroORM.migrator.up();
  // @ts-expect-error - process is defined at runtime
  const port = process.env.PORT || process.env.NODE_PORT || 3000;
  await app.listen(port);
}

function startSwaggerDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('FIUBA Melodia Backend')
    .setDescription('The FIUBA Melodia API description')
    .setVersion('1.0')
    .addTag('melodia')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
