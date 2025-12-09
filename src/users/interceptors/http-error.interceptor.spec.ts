import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let interceptor: HttpErrorInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpErrorInterceptor],
    }).compile();

    interceptor = module.get<HttpErrorInterceptor>(HttpErrorInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through successful responses', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockHandler = {
      handle: () => of({ success: true }),
    } as CallHandler;

    const result$ = interceptor.intercept(mockContext, mockHandler);

    result$.subscribe({
      next: (result) => {
        expect(result).toEqual({ success: true });
        done();
      },
    });
  });

  it('should handle 400 error with email already registered', (done) => {
    const axiosError = new AxiosError('Bad Request');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    axiosError.response = {
      status: 400,
      data: { detail: 'El correo electrónico ya está registrado' },
      statusText: 'Bad Request',
      headers: {},
      config: {},
    } as any;

    const mockContext = {} as ExecutionContext;
    const mockHandler = {
      handle: () => throwError(() => axiosError),
    } as CallHandler;

    const result$ = interceptor.intercept(mockContext, mockHandler);

    result$.subscribe({
      error: (error: HttpException) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        done();
      },
    });
  });

  it('should handle 409 conflict error', (done) => {
    const axiosError = new AxiosError('Conflict');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    axiosError.response = {
      status: 409,
      data: { detail: 'Resource already exists' },
      statusText: 'Conflict',
      headers: {},
      config: {},
    } as any;

    const mockContext = {} as ExecutionContext;
    const mockHandler = {
      handle: () => throwError(() => axiosError),
    } as CallHandler;

    const result$ = interceptor.intercept(mockContext, mockHandler);

    result$.subscribe({
      error: (error: HttpException) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        done();
      },
    });
  });

  it('should handle 404 not found error', (done) => {
    const axiosError = new AxiosError('Not Found');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    axiosError.response = {
      status: 404,
      data: { detail: 'User not found' },
      statusText: 'Not Found',
      headers: {},
      config: {},
    } as any;

    const mockContext = {} as ExecutionContext;
    const mockHandler = {
      handle: () => throwError(() => axiosError),
    } as CallHandler;

    const result$ = interceptor.intercept(mockContext, mockHandler);

    result$.subscribe({
      error: (error: HttpException) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        done();
      },
    });
  });

  it('should re-throw non-Axios errors', (done) => {
    const genericError = new Error('Generic error');
    const mockContext = {} as ExecutionContext;
    const mockHandler = {
      handle: () => throwError(() => genericError),
    } as CallHandler;

    const result$ = interceptor.intercept(mockContext, mockHandler);

    result$.subscribe({
      error: (error) => {
        expect(error).toBe(genericError);
        done();
      },
    });
  });

  it('should handle Axios error without response (network error)', (done) => {
    const axiosError = new AxiosError('Network Error');
    // No response property

    const mockContext = {} as ExecutionContext;
    const mockHandler = {
      handle: () => throwError(() => axiosError),
    } as CallHandler;

    const result$ = interceptor.intercept(mockContext, mockHandler);

    result$.subscribe({
      error: (error: HttpException) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.message).toBe('External service unavailable');
        done();
      },
    });
  });
});
