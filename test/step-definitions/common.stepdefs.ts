import { After, Before, setWorldConstructor, Then } from '@cucumber/cucumber';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import 'tsconfig-paths/register';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MIKRO_ORM_MODULE_OPTIONS } from '@mikro-orm/nestjs';
import { AppModule } from 'src/app.module';
import { MikroORM } from '@mikro-orm/core';
import assert from 'assert';
import { PlaylistDTO } from 'src/business-modules/playlist-manager/dtos/playlist.dto';
import { SongDTO } from 'src/business-modules/song-manager/dtos/song.dto';
import supertest from 'supertest';

Before(async function (this: TestWorld) {
  process.env.NODE_ENV = 'testing';
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
      entities: ['src/**/*.entity.ts'],
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
  const orm = this.app.get(MikroORM);
  const generator = orm.getSchemaGenerator();
  await generator.dropSchema();
  await generator.createSchema();
});

After(async function (this: TestWorld) {
  await this.app.close();
});

export class TestWorld {
  public app!: INestApplication;
  public playlists: Map<string, PlaylistDTO>;
  public songs: Map<string, SongDTO>;
  public response?: supertest.Response;
  public createdPlaylist?: PlaylistDTO;
  public createdSong?: SongDTO;

  constructor() {
    this.playlists = new Map<string, PlaylistDTO>();
    this.songs = new Map<string, SongDTO>();
  }
}

setWorldConstructor(TestWorld);

// Common step definitions

Then(
  'the response status code is {int}',
  function (this: TestWorld, statusCode: number) {
    if (!this.response) {
      throw new Error('Response is not defined');
    }
    assert.strictEqual(
      this.response.status,
      statusCode,
      `Expected status code ${statusCode} but got ${this.response.status}`,
    );
  },
);
