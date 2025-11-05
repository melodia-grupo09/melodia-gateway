import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReleasesService {
  constructor(private readonly httpService: HttpService) {}

  async searchReleases(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/releases/search`, {
        params: {
          query,
          page,
          limit,
        },
      }),
    );
    return response.data;
  }

  async getReleaseById(id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/releases/${id}`),
    );
    return response.data;
  }
}
