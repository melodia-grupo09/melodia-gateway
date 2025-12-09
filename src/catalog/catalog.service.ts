import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export type CatalogPayload = Record<string, unknown>;

@Injectable()
export class CatalogService {
  constructor(private readonly httpService: HttpService) {}

  async listCatalog(params: CatalogPayload): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>('/songs/admin', { params }),
    );
    return response.data;
  }

  async getCatalogItem(kind: string, id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(`/songs/admin/${id}`),
    );
    return response.data;
  }

  async updateCatalogItem(
    kind: string,
    id: string,
    payload: CatalogPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.patch<unknown>(`/songs/admin/${id}`, payload),
    );
    return response.data;
  }

  async blockCatalogItem(
    kind: string,
    id: string,
    payload: CatalogPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post<unknown>(`/songs/admin/${id}/block`, payload),
    );
    return response.data;
  }

  async unblockCatalogItem(
    kind: string,
    id: string,
    payload: CatalogPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post<unknown>(`/songs/admin/${id}/unblock`, payload),
    );
    return response.data;
  }
}
