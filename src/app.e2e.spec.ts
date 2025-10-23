/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should return 200 with status ok', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          // The response should have either topSongs/topAlbums OR metricsError
          expect(
            res.body.topSongs !== undefined ||
              res.body.metricsError !== undefined,
          ).toBe(true);
        });
    });

    it('should have correct response headers', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });
});
