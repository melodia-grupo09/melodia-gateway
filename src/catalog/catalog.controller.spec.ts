import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CatalogController } from './catalog.controller';
import { CatalogPayload, CatalogService } from './catalog.service';

describe('CatalogController', () => {
  let controller: CatalogController;

  const mockCatalogService = {
    listCatalog: jest.fn(),
    getCatalogItem: jest.fn(),
    updateCatalogItem: jest.fn(),
    blockCatalogItem: jest.fn(),
    unblockCatalogItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: mockCatalogService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CatalogController>(CatalogController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listCatalog', () => {
    it('should forward query parameters to the service', async () => {
      const query = { limit: '5' };
      mockCatalogService.listCatalog.mockResolvedValue('result');

      const result = await controller.listCatalog(query);

      expect(result).toBe('result');
      expect(mockCatalogService.listCatalog).toHaveBeenCalledWith(query);
    });
  });

  describe('getCatalogItem', () => {
    it('should request items by kind and id', async () => {
      mockCatalogService.getCatalogItem.mockResolvedValue('item');

      const result = await controller.getCatalogItem('song', '123');

      expect(result).toBe('item');
      expect(mockCatalogService.getCatalogItem).toHaveBeenCalledWith(
        'song',
        '123',
      );
    });
  });

  describe('updateCatalogItem', () => {
    it('should pass payload to the update service', async () => {
      const payload: CatalogPayload = { blocked: false };
      mockCatalogService.updateCatalogItem.mockResolvedValue('updated');

      const result = await controller.updateCatalogItem('song', 'abc', payload);

      expect(result).toBe('updated');
      expect(mockCatalogService.updateCatalogItem).toHaveBeenCalledWith(
        'song',
        'abc',
        payload,
      );
    });
  });

  describe('blockCatalogItem', () => {
    it('should call the blocking endpoint', async () => {
      const payload: CatalogPayload = { reason: 'policy' };
      mockCatalogService.blockCatalogItem.mockResolvedValue('blocked');

      const result = await controller.blockCatalogItem('song', 'xyz', payload);

      expect(result).toBe('blocked');
      expect(mockCatalogService.blockCatalogItem).toHaveBeenCalledWith(
        'song',
        'xyz',
        payload,
      );
    });
  });

  describe('unblockCatalogItem', () => {
    it('should call the unblock endpoint', async () => {
      const payload: CatalogPayload = { reason: 'retry' };
      mockCatalogService.unblockCatalogItem.mockResolvedValue('unblocked');

      const result = await controller.unblockCatalogItem(
        'song',
        'xyz',
        payload,
      );

      expect(result).toBe('unblocked');
      expect(mockCatalogService.unblockCatalogItem).toHaveBeenCalledWith(
        'song',
        'xyz',
        payload,
      );
    });
  });
});
