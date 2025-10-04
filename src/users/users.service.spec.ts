import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockMetricsService = {
    recordUserRegistration: jest.fn(),
    recordUserLogin: jest.fn(),
    recordUserActivity: jest.fn(),
  };

  beforeEach(async () => {
    // Mock console.error to suppress error logs during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register user and track metrics', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const mockResponse = {
        data: 'User registered successfully',
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserRegistration.mockResolvedValue(undefined);

      const result = await service.registerUser(registerDto);

      expect(mockHttpService.post).toHaveBeenCalledWith('/auth/register', {
        email: registerDto.email,
        password: registerDto.password,
        nombre: registerDto.username,
      });

      expect(mockMetricsService.recordUserRegistration).toHaveBeenCalledWith(
        registerDto.email,
      );

      expect(result).toEqual({
        result: 'User registered successfully',
      });
    });

    it('should register user even if metrics tracking fails', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const mockResponse = {
        data: 'User registered successfully',
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserRegistration.mockRejectedValue(
        new Error('Metrics error'),
      );

      const result = await service.registerUser(registerDto);

      expect(result).toEqual({
        result: 'User registered successfully',
      });
    });

    it('should throw error if user service fails', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const error = new Error('User service error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        'User service error',
      );

      expect(mockMetricsService.recordUserRegistration).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should successfully login user and track metrics', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          message: 'Login successful',
          token: 'jwt-token-123',
          user: {
            uid: 'user-123',
            email: 'test@example.com',
            nombre: 'testuser',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserLogin.mockResolvedValue(undefined);
      mockMetricsService.recordUserActivity.mockResolvedValue(undefined);

      const result = await service.loginUser(loginDto);

      expect(mockHttpService.post).toHaveBeenCalledWith('/auth/login', {
        email: loginDto.email,
        password: loginDto.password,
      });

      expect(mockMetricsService.recordUserLogin).toHaveBeenCalledWith(
        'user-123',
      );
      expect(mockMetricsService.recordUserActivity).toHaveBeenCalledWith(
        'user-123',
      );

      expect(result).toEqual({
        accessToken: 'jwt-token-123',
      });
    });

    it('should login user even if metrics tracking fails', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          message: 'Login successful',
          token: 'jwt-token-123',
          user: {
            uid: 'user-123',
            email: 'test@example.com',
            nombre: 'testuser',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserLogin.mockRejectedValue(
        new Error('Metrics error'),
      );
      mockMetricsService.recordUserActivity.mockRejectedValue(
        new Error('Metrics error'),
      );

      const result = await service.loginUser(loginDto);

      expect(result).toEqual({
        accessToken: 'jwt-token-123',
      });
    });

    it('should use email as fallback if uid is not available', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          message: 'Login successful',
          token: 'jwt-token-123',
          user: {
            uid: '',
            email: 'test@example.com',
            nombre: 'testuser',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserLogin.mockResolvedValue(undefined);
      mockMetricsService.recordUserActivity.mockResolvedValue(undefined);

      await service.loginUser(loginDto);

      expect(mockMetricsService.recordUserLogin).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockMetricsService.recordUserActivity).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should successfully send forgot password request', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const mockResponse = {
        data: {
          message: 'Reset password email sent',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        {
          email: forgotPasswordDto.email,
        },
      );

      expect(result).toEqual({
        message: 'Reset password email sent',
      });
    });

    it('should throw error if user service fails', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const error = new Error('User service error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow(
        'User service error',
      );
    });
  });
});
