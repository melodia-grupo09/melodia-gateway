import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';

@Injectable()
export class SongsService {
  constructor(private readonly httpService: HttpService) {}

  async getSongById(songId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get<any>(`/songs/id/${songId}`),
    );
    return response.data;
  }

  async getRandom(limit?: number, page?: number): Promise<any[]> {
    const params: Record<string, number> = {};
    if (limit !== undefined) params['limit'] = limit;
    if (page !== undefined) params['page'] = page;

    const response = await firstValueFrom(
      this.httpService.get<any[]>('/songs/random', { params }),
    );
    return response.data;
  }

  async searchSongs(
    query: string,
    limit: number,
    page: number,
  ): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get<any[]>('/songs/search', {
        params: { query, limit, page },
      }),
    );
    return response.data;
  }

  async streamSong(
    songId: string,
    range: string | string[] | undefined,
  ): Promise<AxiosResponse<Readable>> {
    const headers: Record<string, string | string[]> = {};
    // Si el cliente pide un rango específico
    if (range) {
      headers['range'] = range;
    }

    const config: AxiosRequestConfig = {
      headers,
      responseType: 'stream',
    };
    return firstValueFrom(
      this.httpService.get<Readable>(`/songs/player/play/${songId}`, config),
    );
  }

  async uploadSong(formData: FormData): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/songs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    return response.data;
  }
}
