import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CatalogService, CatalogPayload } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  const mockHttpService = {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listCatalog', () => {
    it('should pass query params to the catalog endpoint', async () => {
      const query: CatalogPayload = { limit: 10 };
      const mockResponse = { data: { items: [] } };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.listCatalog(query);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith('/catalog', {
        params: query,
      });
    });
  });

  describe('getCatalogItem', () => {
    it('should request an item by kind and id', async () => {
      const response = { data: { id: '123' } };
      mockHttpService.get.mockReturnValue(of(response));

      const result = await service.getCatalogItem('songs', '123');

      expect(result).toEqual(response.data);
      expect(mockHttpService.get).toHaveBeenCalledWith('/catalog/songs/123');
    });
  });

  describe('updateCatalogItem', () => {
    it('should patch the catalog entry with the provided payload', async () => {
      const payload: CatalogPayload = { blocked: true };
      const response = { data: { blocked: true } };
      mockHttpService.patch.mockReturnValue(of(response));

      const result = await service.updateCatalogItem('artists', 'abc', payload);

      expect(result).toEqual(response.data);
      expect(mockHttpService.patch).toHaveBeenCalledWith(
        '/catalog/artists/abc',
        payload,
      );
    });
  });

  describe('blockCatalogItem', () => {
    it('should post to the block endpoint', async () => {
      const payload: CatalogPayload = { reason: 'policy' };
      const response = { data: { blocked: true } };
      mockHttpService.post.mockReturnValue(of(response));

      const result = await service.blockCatalogItem('songs', 'xyz', payload);

      expect(result).toEqual(response.data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/catalog/songs/xyz/block',
        payload,
      );
    });
  });

  describe('unblockCatalogItem', () => {
    it('should post to the unblock endpoint', async () => {
      const payload: CatalogPayload = { reason: 'retry' };
      const response = { data: { blocked: false } };
      mockHttpService.post.mockReturnValue(of(response));

      const result = await service.unblockCatalogItem('songs', 'xyz', payload);

      expect(result).toEqual(response.data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        '/catalog/songs/xyz/unblock',
        payload,
      );
    });
  });
});
