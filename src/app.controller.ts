import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import * as admin from 'firebase-admin';

@Controller()
export class AppController {
  @Get()
  @ApiResponse({
    status: 200,
    description: 'APIs healthcheck',
  })
  healthCheck() {
    return { status: 'ok' };
  }

  @Post('verify-token')
  async verifyToken(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const decoded = await admin.auth().verifyIdToken(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { valid: true, decoded };
    } catch (error: unknown) {
      let errorMsg = 'Invalid token';

      // Type guard más seguro para errores
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
      ) {
        errorMsg = (error as { message: string }).message;
      }

      return { valid: false, error: errorMsg };
    }
  }
}
