import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { ArtistsService } from '../artists/artists.service';
import { MetricsService } from '../metrics/metrics.service';

interface UploadResponse {
  id?: string;
  [key: string]: unknown;
}

@Injectable()
export class SongsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly metricsService: MetricsService,
    @Inject(forwardRef(() => ArtistsService))
    private readonly artistsService: ArtistsService,
  ) {}

  async getSongById(songId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get<any>(`/songs/id/${songId}`),
    );
    const songData = response.data;

    // Enrich with cover URL from release
    try {
      const coverData =
        await this.artistsService.getReleaseCoverBySongId(songId);
      return {
        ...songData,
        coverUrl: coverData.coverUrl,
      };
    } catch {
      // If cover fetch fails, return song without cover
      return songData;
    }
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
    userId: string,
    artistId?: string,
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

    // Record song play metrics with user and artist information
    await this.metricsService.recordSongPlay(songId, userId, artistId);

    return firstValueFrom(
      this.httpService.get<Readable>(`/songs/player/play/${songId}`, config),
    );
  }

  async uploadSong(formData: FormData): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post<UploadResponse>('/songs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );

    // Record song upload metrics if we have a song ID in the response
    if (response.data?.id) {
      await this.metricsService.recordSongUpload(response.data.id);
    }

    return response.data;
  }
}
