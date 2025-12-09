import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch http exception', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockImplementation(() => ({
      json: mockJson,
    }));
    const mockGetResponse = jest.fn().mockImplementation(() => ({
      status: mockStatus,
    }));
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: jest.fn(),
    };

    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;

    const exception = new HttpException(
      'Test exception',
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      status: HttpStatus.BAD_REQUEST,
      message: 'Test exception',
      code: 'bad_request',
    });
  });

  it('should handle circular structure in exception response', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockImplementation(() => ({
      json: mockJson,
    }));
    const mockGetResponse = jest.fn().mockImplementation(() => ({
      status: mockStatus,
    }));
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: jest.fn(),
    };

    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;

    // Create a circular object
    const circularObj: any = {};
    circularObj.self = circularObj;

    const exception = new HttpException(
      circularObj,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Http Exception', // Fallback message
      code: undefined,
    });
  });
});
