import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export type CatalogPayload = Record<string, unknown>;

@Injectable()
export class CatalogService {
  constructor(private readonly httpService: HttpService) {}

  async listCatalog(params: CatalogPayload): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>('/catalog', { params }),
    );
    return response.data;
  }

  async getCatalogItem(kind: string, id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(`/catalog/${kind}/${id}`),
    );
    return response.data;
  }

  async updateCatalogItem(
    kind: string,
    id: string,
    payload: CatalogPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch<unknown>(`/catalog/${kind}/${id}`, payload),
    );
    return response.data;
  }

  async blockCatalogItem(
    kind: string,
    id: string,
    payload: CatalogPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post<unknown>(`/catalog/${kind}/${id}/block`, payload),
    );
    return response.data;
  }

  async unblockCatalogItem(
    kind: string,
    id: string,
    payload: CatalogPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post<unknown>(`/catalog/${kind}/${id}/unblock`, payload),
    );
    return response.data;
  }
}
