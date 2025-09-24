import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof AxiosError && error.response) {
          const status = (error.response as { status?: number })?.status;
          const data = (error.response as { data?: unknown })?.data;

          const errorMapping = this.mapExternalError(status ?? 500, data);

          throw new HttpException(
            {
              status: 'error',
              message: errorMapping.message,
              code: errorMapping.code,
            },
            errorMapping.httpStatus,
          );
        }

        // Re-throw non-Axios errors
        throw error;
      }),
    );
  }

  private mapExternalError(
    status: number,
    data: any,
  ): { message: string; code: string; httpStatus: HttpStatus } {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? (data as { detail?: unknown }).detail
        : undefined;

    switch (status) {
      case 400:
        if (typeof detail === 'string') {
          if (detail.includes('correo electrónico ya está registrado')) {
            return {
              message: detail,
              code: 'email_already_registered',
              httpStatus: HttpStatus.BAD_REQUEST,
            };
          }
          if (detail.includes('contraseña')) {
            return {
              message: detail,
              code: 'invalid_password',
              httpStatus: HttpStatus.BAD_REQUEST,
            };
          }
        }

        if (Array.isArray(detail) && detail.length > 0) {
          return {
            message:
              detail[0] &&
              typeof detail[0] === 'object' &&
              typeof (detail[0] as { msg?: unknown }).msg === 'string'
                ? (detail[0] as { msg: string }).msg
                : 'Invalid user data',
            code: 'invalid_user_data',
            httpStatus: HttpStatus.BAD_REQUEST,
          };
        }

        return {
          message: 'Invalid user data',
          code: 'invalid_user_data',
          httpStatus: HttpStatus.BAD_REQUEST,
        };

      case 409:
        return {
          message: typeof detail === 'string' ? detail : 'Resource conflict',
          code: 'resource_conflict',
          httpStatus: HttpStatus.CONFLICT,
        };

      case 404:
        return {
          message: typeof detail === 'string' ? detail : 'Resource not found',
          code: 'resource_not_found',
          httpStatus: HttpStatus.NOT_FOUND,
        };

      default:
        return {
          message:
            typeof detail === 'string' ? detail : 'External service error',
          code: 'external_service_error',
          httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        };
    }
  }
}
