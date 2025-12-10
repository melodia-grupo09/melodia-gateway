import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import { Request } from 'express';
import admin from './firebase';
import { IS_PUBLIC_KEY } from './public.decorator';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: unknown;
  }
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    // Handle case where header might be an array
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (!headerValue || !headerValue.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Invalid Authorization header format. Use: Bearer <token>',
      );
    }

    const token = headerValue.replace('Bearer ', '');

    if (!token || token.length === 0) {
      throw new UnauthorizedException('Token is empty');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Check if user is blocked
      const isBlocked = await this.cacheManager.get(
        `blocked_user:${decodedToken.uid}`,
      );
      if (isBlocked) {
        throw new HttpException(
          {
            status: 403,
            message: 'User is banned',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      request.user = decodedToken;
      return true;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Token verification failed:', error?.message || error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
