import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { UsersModule } from '../users/users.module';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';

interface ErrorResponse {
  status: number;
  message: string | string[];
  code?: string;
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
          throw new BadRequestException('Email already registered');
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
      loginUser: jest.fn((dto: { email: string; password: string }) => {
        if (!dto.email || !dto.password) {
          throw new BadRequestException(
            [
              !dto.email ? 'Email is required' : '',
              !dto.password ? 'Password is required' : '',
            ].filter(Boolean),
          );
        }
        if (dto.email === 'notfound@example.com') {
          throw new BadRequestException('Email not found');
        }
        if (
          dto.email === 'user@example.com' &&
          dto.password !== 'Password123!'
        ) {
          throw new BadRequestException('Incorrect credentials');
        }
        if (
          dto.email === 'user@example.com' &&
          dto.password === 'Password123!'
        ) {
          return Promise.resolve({ accessToken: 'mock-jwt-token' });
        }
        throw new BadRequestException('Incorrect credentials');
      }),
      forgotPassword: jest.fn(() => {
        return Promise.resolve({ message: 'Password reset email sent' });
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

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users/register (POST)', () => {
    describe('/users/login (POST)', () => {
      it('should login successfully with valid credentials', () => {
        const loginUserDto = {
          email: 'user@example.com',
          password: 'Password123!',
        };
        return request(app.getHttpServer())
          .post('/users/login')
          .send(loginUserDto)
          .expect(200)
          .expect((res) => {
            const body = res.body as { accessToken: string };
            expect(body).toHaveProperty('accessToken', 'mock-jwt-token');
          });
      });

      it('should fail login with incorrect password', () => {
        const loginUserDto = {
          email: 'user@example.com',
          password: 'wrongpassword',
        };
        return request(app.getHttpServer())
          .post('/users/login')
          .send(loginUserDto)
          .expect(400)
          .expect((res) => {
            const body = res.body as ErrorResponse;
            expect(body.message).toBe('Incorrect credentials');
            expect(body.status).toBe(400);
            expect(body.code).toBe('bad_request');
          });
      });

      it('should fail login with unregistered email', () => {
        const loginUserDto = {
          email: 'notfound@example.com',
          password: 'Password123!',
        };
        return request(app.getHttpServer())
          .post('/users/login')
          .send(loginUserDto)
          .expect(400)
          .expect((res) => {
            const body = res.body as ErrorResponse;
            expect(body.message).toBe('Email not found');
            expect(body.status).toBe(400);
            expect(body.code).toBe('bad_request');
          });
      });

      it('should fail login when required fields are missing', () => {
        return request(app.getHttpServer())
          .post('/users/login')
          .send({})
          .expect(400)
          .expect((res) => {
            const body = res.body as ErrorResponse;
            expect(Array.isArray(body.message)).toBe(true);
            expect(body.message as string[]).toEqual(
              expect.arrayContaining([
                'Email is required',
                'Password is required',
              ]),
            );
          });
      });
    });
    it('should register a new user successfully', () => {
      const registerUserDto = {
        email: 'new@test.com',
        username: 'newuser',
        password: 'Password123!',
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

    it('should return 400 when email is already registered', () => {
      const registerUserDto = {
        email: 'test@example.com', // This email is in the "registered" list
        username: 'testuser',
        password: 'Password123!',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(registerUserDto)
        .expect(400)
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

    it('should return 400 when password does not meet strength requirements', () => {
      const registerUserDto = {
        email: 'strong@test.com',
        username: 'stronguser',
        password: 'weakpass',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(registerUserDto)
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toContain(
            'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character',
          );
        });
    });

    it('should return 400 when password is too short', () => {
      const registerUserDto = {
        email: 'test@new.com',
        username: 'testuser',
        password: '123',
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

  describe('/users/reset-password (POST)', () => {
    it('should send reset email successfully', () => {
      return request(app.getHttpServer())
        .post('/users/reset-password')
        .send({ email: 'user@example.com' })
        .expect(200)
        .expect((res) => {
          expect((res.body as { message: string }).message).toBe(
            'Password reset email sent',
          );
        });
    });

    it('should return 400 when email is invalid', () => {
      return request(app.getHttpServer())
        .post('/users/reset-password')
        .send({ email: 'invalid-email' })
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toContain('email must be an email');
        });
    });

    it('should return 400 when email is missing', () => {
      return request(app.getHttpServer())
        .post('/users/reset-password')
        .send({})
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toContain('email must be an email');
        });
    });
  });
});
