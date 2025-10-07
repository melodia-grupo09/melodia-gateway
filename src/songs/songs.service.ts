import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';

@Injectable()
export class SongsService {
  constructor(private readonly httpService: HttpService) {}

  async streamSong(
    songId: string,
    range: string | undefined,
  ): Promise<AxiosResponse<Readable>> {
    const headers: Record<string, string> = {};
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
}
