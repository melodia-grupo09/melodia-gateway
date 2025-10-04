import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ResponseFormatInterceptor } from './response-format.interceptor';

describe('ResponseFormatInterceptor', () => {
  let interceptor: ResponseFormatInterceptor<any>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseFormatInterceptor],
    }).compile();

    interceptor = module.get<ResponseFormatInterceptor<any>>(
      ResponseFormatInterceptor,
    );

    mockExecutionContext = {
      switchToHttp: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as jest.Mocked<ExecutionContext>;

    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should format response with data wrapper', (done) => {
    const testData = { id: 1, name: 'test' };
    mockCallHandler.handle.mockReturnValue(of(testData));

    const result$ = interceptor.intercept(
      mockExecutionContext,
      mockCallHandler,
    );

    result$.subscribe({
      next: (result: any) => {
        expect(result).toEqual({ data: testData });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(mockCallHandler.handle).toHaveBeenCalled();
        done();
      },
    });
  });
});
