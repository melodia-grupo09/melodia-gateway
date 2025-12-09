/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './app.module';
import { MetricsService } from './metrics/metrics.service';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MetricsService)
      .useValue({
        getTopSongs: jest.fn().mockResolvedValue([]),
        getTopAlbums: jest.fn().mockResolvedValue([]),
        getTopArtists: jest.fn().mockResolvedValue([]),
      })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 10000);

  afterEach(async () => {
    await app.close();
  }, 10000);

  describe('/ (GET)', () => {
    it('should return 200 with status ok', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      // The response should have either topSongs/topAlbums OR metricsError
      expect(
        response.body.topSongs !== undefined ||
          response.body.metricsError !== undefined,
      ).toBe(true);
    }, 10000);

    it('should have correct response headers', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);
    }, 10000);
  });
});
