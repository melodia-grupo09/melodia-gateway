import { Test, TestingModule } from '@nestjs/testing';
import { ExceptionFilter } from './exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('ExceptionFilter', () => {
  let filter: ExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExceptionFilter],
    }).compile();

    filter = module.get<ExceptionFilter>(ExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException with string message', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockRequest = {
      path: '/test-path',
    };

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException(
      {
        error: 'Bad Request',
        message: 'Validation failed',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      type: 'about:blank',
      title: 'Bad Request',
      detail: 'Validation failed',
      status: 400,
      instance: '/test-path',
    });
  });

  it('should handle HttpException with array message', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockRequest = {
      path: '/test-path',
    };

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException(
      {
        error: 'Bad Request',
        message: ['Field is required', 'Invalid format'],
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith({
      type: 'about:blank',
      title: 'Bad Request',
      detail: 'Field is required. Invalid format',
      status: 400,
      instance: '/test-path',
    });
  });
});
