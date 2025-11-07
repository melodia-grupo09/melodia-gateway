import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface FirebaseUser {
  uid: string;
  email?: string;
  name?: string;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FirebaseUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
