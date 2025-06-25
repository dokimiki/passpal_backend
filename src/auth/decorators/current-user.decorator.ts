import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface RequestWithUser {
  user: User;
  firebaseUser: DecodedIdToken;
  headers: {
    authorization?: string;
  };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

export const CurrentFirebaseUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.firebaseUser;
  },
);
