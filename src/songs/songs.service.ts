import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SongsService {
  constructor(private readonly httpService: HttpService) {}

  async streamSong(songId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/songs/stream/${songId}`),
    );
    return response.data;
  }
}
