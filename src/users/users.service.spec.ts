import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { ArtistsService } from '../artists/artists.service';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LinkGoogleDto } from './dto/link-google.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  };

  const mockMetricsService = {
    recordUserRegistration: jest.fn(),
    recordUserLogin: jest.fn(),
    recordUserActivity: jest.fn(),
  };

  const mockArtistsService = {
    createArtist: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotificationToUserDevices: jest.fn(),
  };

  const mockCacheManager = {
    set: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
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
        {
          provide: ArtistsService,
          useValue: mockArtistsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
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
        country: 'Argentina',
      };

      const mockResponse = {
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserRegistration.mockResolvedValue(undefined);

      const result = await service.registerUser(registerDto);

      expect(mockHttpService.post).toHaveBeenCalledWith('/auth/register', {
        email: registerDto.email,
        password: registerDto.password,
        nombre: registerDto.username,
        pais: registerDto.country,
        esArtista: registerDto.isArtist,
      });

      expect(mockMetricsService.recordUserRegistration).toHaveBeenCalledWith(
        registerDto.email,
      );

      expect(result).toEqual({
        message: 'User registered successfully',
        user: { id: 'test-user-id', email: 'test@example.com' },
      });
    });

    it('should register user even if metrics tracking fails', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        country: 'Argentina',
      };

      const mockResponse = {
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserRegistration.mockRejectedValue(
        new Error('Metrics error'),
      );

      const result = await service.registerUser(registerDto);

      expect(result).toEqual({
        message: 'User registered successfully',
        user: { id: 'test-user-id', email: 'test@example.com' },
      });
    });

    it('should throw error if user service fails', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        country: 'Argentina',
      };

      const error = new Error('User service error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        'Registration failed',
      );
    });

    it('should create artist profile when isArtist is true', async () => {
      const registerDto: RegisterUserDto = {
        email: 'artist@example.com',
        password: 'password123',
        username: 'testartist',
        country: 'Argentina',
        isArtist: true,
      };

      const mockResponse = {
        data: { user: { uid: 'artist-uid-123', email: 'artist@example.com' } },
      };

      const mockArtistResponse = {
        id: 'artist-uid-123',
        name: 'testartist',
        imageUrl: null,
        followersCount: 0,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserRegistration.mockResolvedValue(undefined);
      mockArtistsService.createArtist.mockResolvedValue(mockArtistResponse);

      const result = await service.registerUser(registerDto);

      expect(mockArtistsService.createArtist).toHaveBeenCalledWith(
        expect.objectContaining({
          _boundary: expect.any(String),
        }),
      );

      expect(result).toEqual({
        message: 'User registered successfully',
        user: { uid: 'artist-uid-123', email: 'artist@example.com' },
        artist: mockArtistResponse,
      });
    });

    it('should handle artist creation failure gracefully', async () => {
      const registerDto: RegisterUserDto = {
        email: 'artist@example.com',
        password: 'password123',
        username: 'testartist',
        country: 'Argentina',
        isArtist: true,
      };

      const mockResponse = {
        data: { user: { uid: 'artist-uid-123', email: 'artist@example.com' } },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserRegistration.mockResolvedValue(undefined);
      mockArtistsService.createArtist.mockRejectedValue(
        new Error('Artist service error'),
      );

      const result = await service.registerUser(registerDto);

      expect(mockArtistsService.createArtist).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'User registered successfully',
        user: { uid: 'artist-uid-123', email: 'artist@example.com' },
      });
    });

    it('should not create artist profile when isArtist is false', async () => {
      const registerDto: RegisterUserDto = {
        email: 'user@example.com',
        password: 'password123',
        username: 'testuser',
        country: 'Argentina',
        isArtist: false,
      };

      const mockResponse = {
        data: { user: { uid: 'user-uid-123', email: 'user@example.com' } },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockMetricsService.recordUserRegistration.mockResolvedValue(undefined);

      const result = await service.registerUser(registerDto);

      expect(mockArtistsService.createArtist).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'User registered successfully',
        user: { uid: 'user-uid-123', email: 'user@example.com' },
      });
    });

    it('should handle email already registered error', async () => {
      const registerDto: RegisterUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        username: 'testuser',
        country: 'Argentina',
      };

      const error = {
        response: {
          data: {
            detail: 'El correo electrónico ya está registrado',
          },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        'Email is already registered',
      );
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
          refresh_token: 'refresh-token-456',
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

      const result = (await service.loginUser(loginDto)) as {
        message: string;
        token: string;
        refresh_token: string;
        user: { uid: string; email: string; nombre: string };
      };

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
        message: 'Login successful',
        token: 'jwt-token-123',
        refresh_token: 'refresh-token-456',
        user: {
          uid: 'user-123',
          email: 'test@example.com',
          nombre: 'testuser',
        },
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
          refresh_token: 'refresh-token-456',
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

      const result = (await service.loginUser(loginDto)) as {
        message: string;
        token: string;
        refresh_token: string;
        user: { uid: string; email: string; nombre: string };
      };

      expect(result).toEqual({
        message: 'Login successful',
        token: 'jwt-token-123',
        refresh_token: 'refresh-token-456',
        user: {
          uid: 'user-123',
          email: 'test@example.com',
          nombre: 'testuser',
        },
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
          refresh_token: 'refresh-token-456',
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

    it('should throw HttpException with correct message and status when external service returns an error', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => errorResponse));

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        expect.objectContaining({
          status: 401,
          response: expect.objectContaining({
            message: 'Invalid credentials',
            code: 'login_failed',
          }),
        }),
      );
    });

    it('should handle error with detail property instead of message', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const errorResponse = {
        response: {
          status: 400,
          data: {
            detail: 'Some detailed error',
          },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => errorResponse));

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          response: expect.objectContaining({
            message: 'Some detailed error',
            code: 'login_failed',
          }),
        }),
      );
    });

    it('should throw default HttpException when external service returns an error without response data', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Network error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.loginUser(loginDto)).rejects.toThrow(
        expect.objectContaining({
          status: 400,
          response: expect.objectContaining({
            message: 'Login failed',
            code: 'login_failed',
          }),
        }),
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

      const result = (await service.forgotPassword(forgotPasswordDto)) as {
        message: string;
      };

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

  describe('refreshToken', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully refresh token for valid refresh token', async () => {
      const refreshTokenDto = { refresh_token: 'valid-refresh-token' };
      const mockResponse = {
        data: {
          id_token: 'new-id-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          user_id: 'user-123',
          user: {
            email: 'test@example.com',
            nombre: 'testuser',
            esArtista: false,
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.refreshToken(refreshTokenDto);

      expect(mockHttpService.post).toHaveBeenCalledWith('/auth/refresh-token', {
        refresh_token: 'valid-refresh-token',
      });

      expect(result).toEqual({
        message: 'Token refreshed successfully',
        id_token: 'new-id-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        user: {
          uid: 'user-123',
          email: 'test@example.com',
          nombre: 'testuser',
          esArtista: false,
        },
      });
    });

    it('should handle user without nombre and derive from email', async () => {
      const refreshTokenDto = { refresh_token: 'valid-refresh-token' };
      const mockResponse = {
        data: {
          id_token: 'new-id-token',
          refresh_token: 'new-refresh-token',
          expires_in: '3600',
          user_id: 'user-123',
          user: {
            email: 'test@example.com',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.refreshToken(refreshTokenDto);

      expect(result.user.nombre).toBe('test');
    });

    it('should throw UnauthorizedException for 401 response', async () => {
      const refreshTokenDto = { refresh_token: 'invalid-refresh-token' };
      const errorResponse = {
        response: {
          status: 401,
          data: { detail: 'Invalid refresh token' },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => errorResponse));

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      const refreshTokenDto = { refresh_token: 'some-refresh-token' };
      const errorResponse = {
        response: {
          status: 500,
          data: { detail: 'Server error' },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => errorResponse));

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        'Unable to refresh token - please try again',
      );
    });
  });

  describe('adminRegister', () => {
    it('should successfully register admin', async () => {
      const adminRegisterDto: AdminRegisterDto = {
        email: 'admin@melodia.com',
        password: 'adminpassword123',
        nombre: 'Admin User',
      };

      const mockResponse = {
        data: { admin: { id: 'admin-id', email: 'admin@melodia.com' } },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.adminRegister(adminRegisterDto);

      expect(mockHttpService.post).toHaveBeenCalledWith('/admin/register', {
        email: adminRegisterDto.email,
        password: adminRegisterDto.password,
        nombre: adminRegisterDto.nombre,
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException on admin registration error', async () => {
      const adminRegisterDto: AdminRegisterDto = {
        email: 'admin@melodia.com',
        password: 'adminpassword123',
        nombre: 'Admin User',
      };

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Registration failed')),
      );

      await expect(service.adminRegister(adminRegisterDto)).rejects.toThrow(
        'Admin registration failed',
      );
    });
  });

  describe('adminLogin', () => {
    it('should successfully login admin', async () => {
      const adminLoginDto: AdminLoginDto = {
        email: 'admin@melodia.com',
        password: 'adminpassword123',
      };

      const mockResponse = {
        data: { token: 'admin-jwt-token', admin: { id: 'admin-id' } },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.adminLogin(adminLoginDto);

      expect(mockHttpService.post).toHaveBeenCalledWith('/admin/login', {
        email: adminLoginDto.email,
        password: adminLoginDto.password,
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException on admin login error', async () => {
      const adminLoginDto: AdminLoginDto = {
        email: 'admin@melodia.com',
        password: 'wrongpassword',
      };

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Login failed')),
      );

      await expect(service.adminLogin(adminLoginDto)).rejects.toThrow(
        'Admin login failed',
      );
    });
  });

  describe('adminResetPassword', () => {
    it('should successfully reset admin password', async () => {
      const adminResetPasswordDto: AdminResetPasswordDto = {
        email: 'admin@melodia.com',
      };

      const mockResponse = {
        data: { message: 'Password reset email sent' },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.adminResetPassword(adminResetPasswordDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/admin/reset-password',
        {
          email: adminResetPasswordDto.email,
        },
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException on admin reset password error', async () => {
      const adminResetPasswordDto: AdminResetPasswordDto = {
        email: 'nonexistent@melodia.com',
      };

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Reset failed')),
      );

      await expect(
        service.adminResetPassword(adminResetPasswordDto),
      ).rejects.toThrow('Admin password reset failed');
    });
  });

  describe('listUsers', () => {
    it('should successfully list users with pagination', async () => {
      const listUsersDto: ListUsersDto = {
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: {
          users: [
            { id: 'user1', email: 'user1@example.com' },
            { id: 'user2', email: 'user2@example.com' },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      const mockHttpService = {
        get: jest.fn().mockReturnValue(of(mockResponse)),
        post: jest.fn(),
      };

      // Create new service instance with mock that includes get method
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
          {
            provide: ArtistsService,
            useValue: mockArtistsService,
          },
          {
            provide: NotificationsService,
            useValue: mockNotificationsService,
          },
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager,
          },
        ],
      }).compile();

      const testService = module.get<UsersService>(UsersService);
      const result = await testService.listUsers(listUsersDto);

      expect(mockHttpService.get).toHaveBeenCalledWith('/admin/users', {
        params: {
          page: listUsersDto.page,
          limit: listUsersDto.limit,
        },
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException on list users error', async () => {
      const listUsersDto: ListUsersDto = {
        page: 1,
        limit: 10,
      };

      const mockHttpServiceWithError = {
        get: jest
          .fn()
          .mockReturnValue(throwError(() => new Error('List failed'))),
        post: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: HttpService,
            useValue: mockHttpServiceWithError,
          },
          {
            provide: MetricsService,
            useValue: mockMetricsService,
          },
          {
            provide: ArtistsService,
            useValue: mockArtistsService,
          },
          {
            provide: NotificationsService,
            useValue: mockNotificationsService,
          },
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager,
          },
        ],
      }).compile();

      const testService = module.get<UsersService>(UsersService);

      await expect(testService.listUsers(listUsersDto)).rejects.toThrow(
        'Failed to list users',
      );
    });

    it('should successfully list users with search parameter', async () => {
      const listUsersDto: ListUsersDto = {
        page: 1,
        limit: 10,
        search: 'john',
      };

      const mockResponse = {
        data: {
          users: [
            { id: 'user1', email: 'john@example.com', username: 'john_doe' },
            { id: 'user2', email: 'johnny@example.com', username: 'johnny' },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      const mockHttpService = {
        get: jest.fn().mockReturnValue(of(mockResponse)),
        post: jest.fn(),
      };

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
          {
            provide: ArtistsService,
            useValue: mockArtistsService,
          },
          {
            provide: NotificationsService,
            useValue: mockNotificationsService,
          },
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager,
          },
        ],
      }).compile();

      const testService = module.get<UsersService>(UsersService);
      const result = await testService.listUsers(listUsersDto);

      expect(mockHttpService.get).toHaveBeenCalledWith('/admin/users', {
        params: {
          page: listUsersDto.page,
          limit: listUsersDto.limit,
          search: listUsersDto.search,
        },
      });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('blockUser', () => {
    it('should successfully block user', async () => {
      const userId = 'user123';
      const mockResponse = {
        data: { message: 'User blocked successfully' },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.blockUser(userId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/admin/users/${userId}/block`,
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `blocked_user:${userId}`,
        true,
        0,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException on block user error', async () => {
      const userId = 'user123';

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Block failed')),
      );

      await expect(service.blockUser(userId)).rejects.toThrow(
        'Failed to block user',
      );
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('unblockUser', () => {
    it('should successfully unblock user', async () => {
      const userId = 'user123';
      const mockResponse = {
        data: { message: 'User unblocked successfully' },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.unblockUser(userId);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/admin/users/${userId}/unblock`,
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        `blocked_user:${userId}`,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException on unblock user error', async () => {
      const userId = 'user123';

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Unblock failed')),
      );

      await expect(service.unblockUser(userId)).rejects.toThrow(
        'Failed to unblock user',
      );
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete user', async () => {
      const userId = 'user123';
      const mockResponse = {
        data: { message: 'User deleted successfully' },
      };

      const mockHttpServiceWithDelete = {
        delete: jest.fn().mockReturnValue(of(mockResponse)),
        post: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: HttpService,
            useValue: mockHttpServiceWithDelete,
          },
          {
            provide: MetricsService,
            useValue: mockMetricsService,
          },
          {
            provide: ArtistsService,
            useValue: mockArtistsService,
          },
          {
            provide: NotificationsService,
            useValue: mockNotificationsService,
          },
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager,
          },
        ],
      }).compile();

      const testService = module.get<UsersService>(UsersService);
      const result = await testService.deleteUser(userId);

      expect(mockHttpServiceWithDelete.delete).toHaveBeenCalledWith(
        `/admin/users/${userId}`,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw HttpException on delete user error', async () => {
      const userId = 'user123';

      const mockHttpServiceWithError = {
        delete: jest
          .fn()
          .mockReturnValue(throwError(() => new Error('Delete failed'))),
        post: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: HttpService,
            useValue: mockHttpServiceWithError,
          },
          {
            provide: MetricsService,
            useValue: mockMetricsService,
          },
          {
            provide: ArtistsService,
            useValue: mockArtistsService,
          },
          {
            provide: NotificationsService,
            useValue: mockNotificationsService,
          },
          {
            provide: CACHE_MANAGER,
            useValue: mockCacheManager,
          },
        ],
      }).compile();

      const testService = module.get<UsersService>(UsersService);

      await expect(testService.deleteUser(userId)).rejects.toThrow(
        'Failed to delete user',
      );
    });
  });

  // Tests for new methods
  describe('changeUserRole', () => {
    it('should change user role successfully', async () => {
      const userId = 'user123';
      const changeRoleDto = { esArtista: true };
      const mockResponse = { message: 'Usuario actualizado a artista' };

      mockHttpService.patch.mockReturnValue(of({ data: mockResponse }));

      const result = await service.changeUserRole(userId, changeRoleDto);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/admin/users/${userId}/role`,
        changeRoleDto,
      );
    });

    it('should throw error when change user role fails', async () => {
      const userId = 'user123';
      const changeRoleDto = { esArtista: true };

      mockHttpService.patch.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        service.changeUserRole(userId, changeRoleDto),
      ).rejects.toThrow('Failed to change user role');
    });
  });

  describe('getUserDetails', () => {
    it('should get user details successfully', async () => {
      const userId = 'user123';
      const mockResponse = {
        uid: userId,
        email: 'user@example.com',
        nombre: 'Test User',
      };

      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getUserDetails(userId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/admin/users/profile/${userId}`,
      );
    });

    it('should throw error when get user details fails', async () => {
      const userId = 'user123';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getUserDetails(userId)).rejects.toThrow(
        'Failed to get user details',
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const searchUsersDto = { query: 'test', page: 1, limit: 10 };
      const mockResponse = {
        query: 'test',
        results: [{ uid: 'user1', nombre: 'testuser' }],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      };

      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.searchUsers(searchUsersDto);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith('/profile/search', {
        params: {
          query: searchUsersDto.query,
          page: searchUsersDto.page,
          limit: searchUsersDto.limit,
        },
      });
    });

    it('should throw error when search users fails', async () => {
      const searchUsersDto = { query: 'test', page: 1, limit: 10 };

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.searchUsers(searchUsersDto)).rejects.toThrow(
        'Failed to search users',
      );
    });
  });

  describe('getProfile', () => {
    it('should get profile successfully', async () => {
      const userId = 'user123';
      const mockResponse = {
        uid: userId,
        email: 'user@example.com',
        nombre: 'Test User',
      };

      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getProfile(userId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(`/profile/${userId}`);
    });

    it('should throw error when get profile fails', async () => {
      const userId = 'user123';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getProfile(userId)).rejects.toThrow(
        'Failed to get profile',
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userId = 'user123';
      const updateProfileDto = { nombre: 'Updated Name', pais: 'Argentina' };
      const mockResponse = { message: 'Profile updated successfully' };

      mockHttpService.patch.mockReturnValue(of({ data: mockResponse }));

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.patch).toHaveBeenCalledWith(
        `/profile/${userId}`,
        updateProfileDto,
      );
    });

    it('should throw error when update profile fails', async () => {
      const userId = 'user123';
      const updateProfileDto = { nombre: 'Updated Name' };

      mockHttpService.patch.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        service.updateProfile(userId, updateProfileDto),
      ).rejects.toThrow('Failed to update profile');
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should upload profile photo successfully', async () => {
      const userId = 'user123';
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'profile.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockResponse = {
        message: 'Profile photo uploaded successfully',
        foto_perfil_url:
          'https://res.cloudinary.com/example/image/upload/v123/profile.jpg',
      };

      mockHttpService.post.mockReturnValue(of({ data: mockResponse }));

      const result = await service.uploadProfilePhoto(userId, mockFile);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/profile/${userId}/photo`,
        expect.objectContaining({
          _boundary: expect.any(String),
        }),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
    });

    it('should throw error when upload profile photo fails', async () => {
      const userId = 'user123';
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'profile.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Upload failed')),
      );

      await expect(
        service.uploadProfilePhoto(userId, mockFile),
      ).rejects.toThrow('Failed to upload profile photo');
    });

    it('should handle large file uploads', async () => {
      const userId = 'user123';
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB
      const mockFile = {
        buffer: largeBuffer,
        originalname: 'large-profile.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockResponse = {
        message: 'Profile photo uploaded successfully',
        foto_perfil_url:
          'https://res.cloudinary.com/example/image/upload/v123/large-profile.jpg',
      };

      mockHttpService.post.mockReturnValue(of({ data: mockResponse }));

      const result = await service.uploadProfilePhoto(userId, mockFile);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('should handle different image formats', async () => {
      const userId = 'user123';
      const mockFile = {
        buffer: Buffer.from('fake-png-data'),
        originalname: 'profile.png',
        mimetype: 'image/png',
      } as Express.Multer.File;

      const mockResponse = {
        message: 'Profile photo uploaded successfully',
        foto_perfil_url:
          'https://res.cloudinary.com/example/image/upload/v123/profile.png',
      };

      mockHttpService.post.mockReturnValue(of({ data: mockResponse }));

      const result = await service.uploadProfilePhoto(userId, mockFile);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPublicProfile', () => {
    it('should get public profile successfully', async () => {
      const userId = 'user123';
      const mockResponse = {
        uid: userId,
        nombre: 'Test User',
        foto_perfil_url: null,
      };

      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getPublicProfile(userId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/profile/public/${userId}`,
      );
    });

    it('should throw error when get public profile fails', async () => {
      const userId = 'user123';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getPublicProfile(userId)).rejects.toThrow(
        'Failed to get public profile',
      );
    });
  });

  describe('followUser', () => {
    it('should follow user successfully', async () => {
      const userId = 'user123';
      const followerUserId = 'follower456';
      const mockResponse = { message: 'Ahora sigues a este usuario' };

      mockHttpService.post.mockReturnValue(of({ data: mockResponse }));

      const result = await service.followUser(userId, followerUserId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/profile/${followerUserId}/follow/${userId}`,
      );
    });

    it('should throw error when follow user fails', async () => {
      const userId = 'user123';
      const followerUserId = 'follower456';

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.followUser(userId, followerUserId)).rejects.toThrow(
        'Failed to follow user',
      );
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow user successfully', async () => {
      const userId = 'user123';
      const followerUserId = 'follower456';
      const mockResponse = { message: 'Has dejado de seguir a este usuario' };

      mockHttpService.post.mockReturnValue(of({ data: mockResponse }));

      const result = await service.unfollowUser(userId, followerUserId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/profile/${followerUserId}/unfollow/${userId}`,
      );
    });

    it('should throw error when unfollow user fails', async () => {
      const userId = 'user123';
      const followerUserId = 'follower456';

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        service.unfollowUser(userId, followerUserId),
      ).rejects.toThrow('Failed to unfollow user');
    });
  });

  describe('isFollowing', () => {
    it('should check if following successfully', async () => {
      const userId = 'user123';
      const followerUserId = 'follower456';
      const mockResponse = { isFollowing: true };

      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.isFollowing(userId, followerUserId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/profile/${followerUserId}/is-following/${userId}`,
      );
    });

    it('should throw error when check follow status fails', async () => {
      const userId = 'user123';
      const followerUserId = 'follower456';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.isFollowing(userId, followerUserId)).rejects.toThrow(
        'Failed to check follow status',
      );
    });
  });

  describe('getFollowersCount', () => {
    it('should get followers count successfully', async () => {
      const userId = 'user123';
      const mockResponse = { count: 42 };

      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getFollowersCount(userId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/profile/${userId}/followers-count`,
      );
    });

    it('should throw error when get followers count fails', async () => {
      const userId = 'user123';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getFollowersCount(userId)).rejects.toThrow(
        'Failed to get followers count',
      );
    });
  });

  describe('getFollowingCount', () => {
    it('should get following count successfully', async () => {
      const userId = 'user123';
      const mockResponse = { count: 24 };

      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getFollowingCount(userId);

      expect(result).toEqual(mockResponse);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/profile/${userId}/following-count`,
      );
    });

    it('should throw error when get following count fails', async () => {
      const userId = 'user123';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getFollowingCount(userId)).rejects.toThrow(
        'Failed to get following count',
      );
    });
  });

  describe('getFollowers', () => {
    it('should get followers successfully', async () => {
      const userId = 'user123';
      const page = 1;
      const limit = 10;
      const mockResponse = {
        data: {
          followers: [
            { id: 'follower1', username: 'follower1' },
            { id: 'follower2', username: 'follower2' },
          ],
          pagination: { page: 1, limit: 10, total: 2 },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getFollowers(userId, page, limit);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/profile/${userId}/followers`,
        { params: { page, limit } },
      );
    });

    it('should handle errors when getting followers fails', async () => {
      const userId = 'user123';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getFollowers(userId)).rejects.toThrow(
        'Failed to get followers',
      );
    });
  });

  describe('getFollowing', () => {
    it('should get following list successfully', async () => {
      const userId = 'user123';
      const page = 1;
      const limit = 10;
      const mockResponse = {
        data: {
          following: [
            { id: 'following1', username: 'following1' },
            { id: 'following2', username: 'following2' },
          ],
          pagination: { page: 1, limit: 10, total: 2 },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getFollowing(userId, page, limit);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/profile/${userId}/following`,
        { params: { page, limit } },
      );
    });

    it('should handle errors when getting following fails', async () => {
      const userId = 'user123';

      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getFollowing(userId)).rejects.toThrow(
        'Failed to get following',
      );
    });
  });

  describe('loginGoogle', () => {
    it('should successfully login with google', async () => {
      const googleLoginDto: GoogleLoginDto = {
        id_token: 'test-token',
      };

      const mockResponse = {
        data: {
          token: 'access-token',
          refresh_token: 'refresh-token',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.loginGoogle(googleLoginDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/auth/login/google',
        googleLoginDto,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when google login fails', async () => {
      const googleLoginDto: GoogleLoginDto = {
        id_token: 'invalid-token',
      };

      const error = new Error('Login failed');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.loginGoogle(googleLoginDto)).rejects.toThrow(error);
    });
  });

  describe('linkGoogle', () => {
    it('should successfully link google account', async () => {
      const userId = 'user-123';
      const linkGoogleDto: LinkGoogleDto = {
        id_token: 'test-token',
      };

      const mockResponse = {
        data: {
          message: 'Account linked successfully',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.linkGoogle(userId, linkGoogleDto);

      expect(mockHttpService.post).toHaveBeenCalledWith('/auth/link/google', {
        user_id: userId,
        id_token: linkGoogleDto.id_token,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when linking google account fails', async () => {
      const userId = 'user-123';
      const linkGoogleDto: LinkGoogleDto = {
        id_token: 'invalid-token',
      };

      const error = new Error('Link failed');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.linkGoogle(userId, linkGoogleDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getUserRegion', () => {
    it('should return user region successfully', async () => {
      const token = 'valid-token';
      const mockResponse = { data: 'AR' };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getUserRegion(token);

      expect(mockHttpService.get).toHaveBeenCalledWith('/profile/me/country', {
        params: { token },
      });
      expect(result).toBe('AR');
    });

    it('should return "unknown" when service call fails', async () => {
      const token = 'valid-token';
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Error')));

      const result = await service.getUserRegion(token);

      expect(result).toBe('unknown');
    });
  });

  describe('shareSongs', () => {
    it('should share songs successfully and send notification', async () => {
      const uid = 'user123';
      const shareSongsDto = { song_ids: ['song1', 'song2'] };
      const mockSender = { uid: 'sender123', name: 'Sender' };
      const mockResponse = { data: { message: 'Songs shared successfully' } };

      mockHttpService.post.mockReturnValue(of(mockResponse));
      mockNotificationsService.sendNotificationToUserDevices.mockResolvedValue(
        undefined,
      );

      const result = await service.shareSongs(uid, shareSongsDto, mockSender);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `/feed/${uid}/share`,
        shareSongsDto,
      );
      expect(
        mockNotificationsService.sendNotificationToUserDevices,
      ).toHaveBeenCalledWith({
        userId: uid,
        title: 'New Song Shared',
        body: 'Sender shared a song with you',
        data: {
          type: 'SONG_SHARE',
          redirect: 'home',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when share songs fails', async () => {
      const uid = 'user123';
      const shareSongsDto = { song_ids: ['song1', 'song2'] };
      const mockSender = { uid: 'sender123', name: 'Sender' };

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Error')),
      );

      await expect(
        service.shareSongs(uid, shareSongsDto, mockSender),
      ).rejects.toThrow();
    });
  });

  describe('getUserFeed', () => {
    it('should get user feed successfully', async () => {
      const uid = 'user123';
      const mockResponse = {
        data: {
          feed: [
            { id: 'song1', title: 'Song 1' },
            { id: 'song2', title: 'Song 2' },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getUserFeed(uid);

      expect(mockHttpService.get).toHaveBeenCalledWith(`/feed/${uid}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when get user feed fails', async () => {
      const uid = 'user123';

      mockHttpService.get.mockReturnValue(throwError(() => new Error('Error')));

      await expect(service.getUserFeed(uid)).rejects.toThrow();
    });
  });

  describe('removeSongsFromFeed', () => {
    it('should remove songs from feed successfully', async () => {
      const uid = 'user123';
      const songIds = ['song1', 'song2'];
      const mockResponse = { data: { message: 'Songs removed successfully' } };

      mockHttpService.delete.mockReturnValue(of(mockResponse));

      const result = await service.removeSongsFromFeed(uid, songIds);

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `/feed/${uid}/songs`,
        { params: { song_ids: songIds } },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when remove songs from feed fails', async () => {
      const uid = 'user123';
      const songIds = ['song1', 'song2'];

      mockHttpService.delete.mockReturnValue(
        throwError(() => new Error('Error')),
      );

      await expect(service.removeSongsFromFeed(uid, songIds)).rejects.toThrow();
    });
  });
});
