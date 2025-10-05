import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ArtistsService {
  constructor(private readonly httpService: HttpService) {}

  async createArtist(createArtistData: FormData): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/artists', createArtistData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    return response.data;
  }

  async getArtist(id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${id}`),
    );
    return response.data;
  }

  async updateArtist(id: string, updateData: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}`, updateData),
    );
    return response.data;
  }

  async deleteArtist(id: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.delete(`/artists/${id}`),
    );
    return response.data;
  }

  async updateArtistBio(id: string, bioData: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}/bio`, bioData),
    );
    return response.data;
  }

  async updateArtistImage(id: string, imageData: FormData): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}/image`, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    return response.data;
  }

  async updateArtistCover(id: string, coverData: FormData): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/artists/${id}/cover`, coverData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    return response.data;
  }
}
