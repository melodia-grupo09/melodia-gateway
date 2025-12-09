import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof AxiosError) {
          if (error.response) {
            const status =
              (error.response as { status?: number })?.status ?? 500;
            let data = (error.response as { data?: unknown })?.data;
            if (
              data &&
              typeof data === 'object' &&
              Object.keys(data).length === 0
            ) {
              data = undefined;
            }

            // Pass through the exact status code from the external service
            throw new HttpException(
              data || { message: 'External service error' },
              status,
            );
          }

          this.logger.error(`Axios error: ${error.message}`);
          throw new HttpException('External service unavailable', 503);
        }

        // Re-throw non-Axios errors
        throw error;
      }),
    );
  }
}
