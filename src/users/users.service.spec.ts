import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { ArtistsService } from '../artists/artists.service';
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

  const mockArtistsService = {
    createArtist: jest.fn(),
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
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
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
        message: 'User registered successfully',
        user: { id: 'test-user-id', email: 'test@example.com' },
      });
    });

    it('should register user even if metrics tracking fails', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
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
        expect.any(FormData),
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
        user: { uid: string; email: string; nombre: string };
      };

      expect(result).toEqual({
        message: 'Login successful',
        token: 'jwt-token-123',
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
    // Mock Firebase admin
    const mockVerifyIdToken = jest.fn();
    const mockCreateCustomToken = jest.fn();
    const mockGetUser = jest.fn();

    beforeEach(() => {
      // Mock the Firebase module import
      jest.doMock('../auth/firebase', () => ({
        default: {
          auth: () => ({
            verifyIdToken: mockVerifyIdToken,
            createCustomToken: mockCreateCustomToken,
            getUser: mockGetUser,
          }),
        },
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully refresh token for valid user', async () => {
      const mockPayload = {
        user_id: 'user-123',
        sub: 'user-123',
        email: 'test@example.com',
        exp: Date.now() / 1000 + 3600,
        iat: Date.now() / 1000,
      };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString(
        'base64',
      );
      const mockJWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;
      const authHeader = `Bearer ${mockJWT}`;

      const result = await service.refreshToken(authHeader);

      expect(result).toEqual({
        message: 'Token refreshed successfully (dev mode)',
        token: expect.stringMatching(/^dev-refreshed-token-\d+$/),
        user: {
          uid: 'user-123',
          email: 'test@example.com',
          nombre: 'test',
          esArtista: false,
        },
      });
    });

    it('should handle user without displayName', async () => {
      const mockPayload = {
        user_id: 'user-123',
        sub: 'user-123',
        email: 'test@example.com',
        exp: Date.now() / 1000 + 3600,
        iat: Date.now() / 1000,
      };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString(
        'base64',
      );
      const mockJWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;
      const authHeader = `Bearer ${mockJWT}`;

      const result = await service.refreshToken(authHeader);

      expect(result.user.nombre).toBe('test');
    });

    it('should throw error when token verification fails', async () => {
      const authHeader = 'Bearer invalid-token';

      await expect(service.refreshToken(authHeader)).rejects.toThrow(
        'Unable to refresh token - please login again',
      );
    });

    it('should throw error when token format is invalid', async () => {
      const authHeader = 'Bearer invalid.token';

      await expect(service.refreshToken(authHeader)).rejects.toThrow(
        'Unable to refresh token - please login again',
      );
    });

    it('should throw error when token payload is malformed', async () => {
      const authHeader = 'Bearer header.invalid-base64.signature';

      await expect(service.refreshToken(authHeader)).rejects.toThrow(
        'Unable to refresh token - please login again',
      );
    });

    it('should throw error when authorization header is missing', async () => {
      await expect(service.refreshToken(undefined)).rejects.toThrow(
        'Authorization header is required',
      );
    });
  });
});
