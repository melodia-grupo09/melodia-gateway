import { After, Before, setWorldConstructor, Then } from "@cucumber/cucumber";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import "tsconfig-paths/register";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { MIKRO_ORM_MODULE_OPTIONS } from "@mikro-orm/nestjs";
import { AppModule } from "src/app.module";
import { MikroORM } from "@mikro-orm/core";

Before(async function () {
  try {
    process.env.NODE_ENV = "testing";
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MIKRO_ORM_MODULE_OPTIONS)
      .useValue({
        driver: PostgreSqlDriver,
        debug: false,
        host: process.env.TEST_DATABASE_HOST,
        port: parseInt(process.env.TEST_DATABASE_PORT!, 10),
        user: process.env.TEST_DATABASE_USER,
        password: process.env.TEST_DATABASE_PASSWORD,
        dbName: process.env.TEST_DATABASE_NAME,
        entities: ["src/**/*.entity.ts"],
      })
      .compile();

    this.app = moduleRef.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await this.app.init();
    const orm = this.app.get(MikroORM) as MikroORM;
    const generator = orm.getSchemaGenerator();
    await generator.dropSchema();
    await generator.createSchema();
  } catch (error) {
    throw error;
  }
});

After(async function () {
  await this.app.close();
});

export class TestWorld {
  public app!: INestApplication;
}

setWorldConstructor(TestWorld);
