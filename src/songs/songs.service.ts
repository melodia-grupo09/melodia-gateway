import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { ArtistsService } from '../artists/artists.service';
import { MetricsService } from '../metrics/metrics.service';

export interface SongArtist {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface SongDetails {
  id: string;
  title?: string;
  duration?: number;
  coverUrl?: string;
  artists?: SongArtist[];
  [key: string]: unknown;
}

export interface UploadResponse {
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

  async getSongById(songId: string): Promise<SongDetails> {
    const response = await firstValueFrom(
      this.httpService.get<SongDetails>(`/songs/id/${songId}`),
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

  async getRandom(limit?: number, page?: number): Promise<SongDetails[]> {
    const params: Record<string, number> = {};
    if (limit !== undefined) params['limit'] = limit;
    if (page !== undefined) params['page'] = page;

    const response = await firstValueFrom(
      this.httpService.get<SongDetails[]>('/songs/random', { params }),
    );
    return response.data;
  }

  async searchSongs(
    query: string,
    limit: number,
    page: number,
  ): Promise<SongDetails[]> {
    const response = await firstValueFrom(
      this.httpService.get<SongDetails[]>('/songs/search', {
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
    region?: string,
  ): Promise<AxiosResponse<Readable>> {
    const headers: Record<string, string | string[]> = {};
    // Si el cliente pide un rango específico
    if (range) {
      headers['range'] = range;
    }

    const params: Record<string, string> = {};
    if (region) params.region = region;

    const config: AxiosRequestConfig = {
      headers,
      responseType: 'stream',
      params,
    };

    // Record song play metrics with user and artist information
    await this.metricsService.recordSongPlay(songId, userId, artistId, region);

    return firstValueFrom(
      this.httpService.get<Readable>(`/songs/player/play/${songId}`, config),
    );
  }

  async uploadSong(formData: FormData): Promise<UploadResponse> {
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
