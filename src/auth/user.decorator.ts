import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface FirebaseUser {
  uid: string;
  email?: string;
  name?: string;
}

// Extend Express Request to include user property
interface RequestWithUser extends Request {
  user?: FirebaseUser;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FirebaseUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
