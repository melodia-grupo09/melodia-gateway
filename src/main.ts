import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { MikroORM } from '@mikro-orm/postgresql';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionFilter } from './framework/filters/exception.filter';

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
  app.enableCors();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

function startSwaggerDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('FIUBA Melodia Backend')
    .setDescription('The FIUBA Melodia API description')
    .setVersion('1.0')
    .addTag('melodia')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises */
bootstrap();
