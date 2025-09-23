import {
  BadRequestException,
  ConflictException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { UsersModule } from '../users/users.module';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';

interface ErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

describe('Users Registration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const mockUsersService = {
      registerUser: jest.fn((dto: RegisterUserDto) => {
        if (!dto.email || !dto.username || !dto.password) {
          throw new BadRequestException(
            [
              !dto.email ? 'Email is required' : '',
              !dto.username ? 'Username is required' : '',
              !dto.password ? 'Password is required' : '',
            ].filter(Boolean),
          );
        }
        if (dto.email === 'test@example.com') {
          throw new ConflictException('Email already registered');
        }
        if (!dto.email.includes('@')) {
          throw new BadRequestException('Email format is invalid');
        }
        if (dto.password.length < 6) {
          throw new BadRequestException(
            'Password must be at least 6 characters long',
          );
        }
        if (!dto.username) {
          throw new BadRequestException('Username is required');
        }
        return Promise.resolve({
          id: 'mock-id',
          username: dto.username,
          email: dto.email,
          createdAt: new Date().toISOString(),
        });
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Add validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users/register (POST)', () => {
    it('should register a new user successfully', () => {
      const registerUserDto = {
        email: 'new@test.com',
        username: 'newuser',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(registerUserDto)
        .expect(201)
        .expect((res) => {
          const body = res.body as UserResponse;
          expect(body).toHaveProperty('id');
          expect(body).toHaveProperty('username', 'newuser');
          expect(body).toHaveProperty('email', 'new@test.com');
          expect(body).toHaveProperty('createdAt');
          expect(body).not.toHaveProperty('password');
        });
    });

    it('should return 409 when email is already registered', () => {
      const registerUserDto = {
        email: 'test@example.com', // This email is in the "registered" list
        username: 'testuser',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(registerUserDto)
        .expect(409)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toBe('Email already registered');
        });
    });

    it('should return 400 when email format is invalid', () => {
      const registerUserDto = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(registerUserDto)
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toContain('Email format is invalid');
        });
    });

    it('should return 400 when password is too short', () => {
      const registerUserDto = {
        email: 'test@new.com',
        username: 'testuser',
        password: '123', // Less than 6 characters
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(registerUserDto)
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toContain(
            'Password must be at least 6 characters long',
          );
        });
    });

    it('should return 400 when username is empty', () => {
      const registerUserDto = {
        email: 'test@new.com',
        username: '', // Empty username
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(registerUserDto)
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toContain('Username is required');
        });
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({}) // No fields sent
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(Array.isArray(body.message)).toBe(true);
          expect(body.message as string[]).toEqual(
            expect.arrayContaining([
              'Email is required',
              'Username is required',
              'Password is required',
            ]),
          );
        });
    });
  });
});
