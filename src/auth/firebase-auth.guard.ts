import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import admin from './firebase';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: unknown;
  }
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader) {
      console.error('No Authorization header found');
      throw new UnauthorizedException('Missing Authorization header');
    }

    // Handle case where header might be an array
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (!headerValue || !headerValue.startsWith('Bearer ')) {
      console.error('Authorization header does not start with Bearer');
      throw new UnauthorizedException(
        'Invalid Authorization header format. Use: Bearer <token>',
      );
    }

    const token = headerValue.replace('Bearer ', '');

    if (!token || token.length === 0) {
      console.error('Token is empty after removing Bearer prefix');
      throw new UnauthorizedException('Token is empty');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error: any) {
      console.error('Token verification failed:', error?.message || error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
