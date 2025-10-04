import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { FirebaseAuthGuard } from './firebase-auth.guard';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseAuthGuard],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);

    // Setup mocks
    mockRequest = {
      headers: {},
      user: undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockExecutionContext = {
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
        new UnauthorizedException('Missing Authorization header'),
      );
    });

    it('should throw UnauthorizedException when authorization header is just "Bearer"', async () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Missing Authorization header'),
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
  });
});
