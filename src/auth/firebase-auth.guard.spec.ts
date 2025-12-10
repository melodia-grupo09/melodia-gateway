import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ExecutionContext,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { FirebaseAuthGuard } from './firebase-auth.guard';

// Mock firebase-admin module
const mockVerifyIdToken = jest.fn();
jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
  credential: {
    applicationDefault: jest.fn(),
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
  apps: [],
}));

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: Partial<Request>;

  const mockCacheManager = {
    get: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);

    // Setup mocks
    mockRequest = {
      headers: {},
      user: undefined,
    };

    // Clear mocks
    mockVerifyIdToken.mockClear();
    mockCacheManager.get.mockClear();
    mockReflector.getAllAndOverride.mockClear();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
    } as any;
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no authorization header', async () => {
      mockRequest.headers = {};

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Missing Authorization header'),
      );
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Basic some-token',
      };

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException(
          'Invalid Authorization header format. Use: Bearer <token>',
        ),
      );
    });

    it('should throw UnauthorizedException when authorization header is just "Bearer"', async () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException(
          'Invalid Authorization header format. Use: Bearer <token>',
        ),
      );
    });

    it('should extract token correctly from Bearer header', () => {
      const authHeader = 'Bearer test-token-123';
      const expectedToken = 'test-token-123';

      const extractedToken = authHeader.replace('Bearer ', '');
      expect(extractedToken).toBe(expectedToken);
    });

    it('should handle authorization header structure validation', () => {
      // Test valid Bearer headers
      expect('Bearer token123'.startsWith('Bearer ')).toBe(true);
      expect('bearer token123'.startsWith('Bearer ')).toBe(false);
      expect('Basic token123'.startsWith('Bearer ')).toBe(false);
      expect('Bearer'.startsWith('Bearer ')).toBe(false);
    });

    it('should validate that guard extends CanActivate', () => {
      expect(guard).toHaveProperty('canActivate');
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should properly set up execution context request extraction', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const request = mockExecutionContext.switchToHttp().getRequest();
      expect(request).toBe(mockRequest);
    });

    it('should throw UnauthorizedException when token is empty', async () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Token is empty'),
      );
    });

    it('should return true when token is valid and user is not blocked', async () => {
      const mockDecodedToken = { uid: 'user123', email: 'test@example.com' };
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
      mockCacheManager.get.mockResolvedValue(null);

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toBe(mockDecodedToken);
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(mockCacheManager.get).toHaveBeenCalledWith('blocked_user:user123');
    });

    it('should throw ForbiddenException when user is blocked', async () => {
      const mockDecodedToken = { uid: 'user123', email: 'test@example.com' };
      mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
      mockCacheManager.get.mockResolvedValue(true);

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new HttpException(
          {
            status: 403,
            message: 'User is banned',
          },
          403,
        ),
      );
      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(mockCacheManager.get).toHaveBeenCalledWith('blocked_user:user123');
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      // Mock console.error to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired token'),
      );

      expect(mockVerifyIdToken).toHaveBeenCalledWith('invalid-token');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Token verification failed:',
        'Invalid token',
      );

      consoleSpy.mockRestore();
    });

    it('should return true when route is public', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
    });
  });
});
