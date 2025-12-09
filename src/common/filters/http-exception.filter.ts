import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let code: string | undefined;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const msg = (exceptionResponse as { message?: unknown }).message;
      if (typeof msg === 'string') {
        message = msg;
      } else if (Array.isArray(msg)) {
        message = msg;
      } else {
        const stringified = JSON.stringify(exceptionResponse);
        message = stringified === '{}' ? exception.message : stringified;
      }
      code = (exceptionResponse as { code?: string }).code;
    } else {
      message = exception.message;
    }

    response.status(status).json({
      status,
      message,
      code: code || (status === 400 ? 'bad_request' : undefined),
    });
  }
}
