import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

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

  // Release methods
  async getArtistReleases(artistId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${artistId}/releases`),
    );
    return response.data;
  }

  async createRelease(
    artistId: string,
    createReleaseDto: CreateReleaseDto,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`/artists/${artistId}/releases`, createReleaseDto),
    );
    return response.data;
  }

  async getArtistRelease(artistId: string, releaseId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/artists/${artistId}/releases/${releaseId}`),
    );
    return response.data;
  }

  async updateRelease(
    artistId: string,
    releaseId: string,
    updateReleaseDto: UpdateReleaseDto,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/artists/${artistId}/releases/${releaseId}`,
        updateReleaseDto,
      ),
    );
    return response.data;
  }

  async deleteRelease(artistId: string, releaseId: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.delete(`/artists/${artistId}/releases/${releaseId}`),
    );
    return response.data;
  }

  async updateReleaseCover(
    artistId: string,
    releaseId: string,
    coverData: FormData,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(
        `/artists/${artistId}/releases/${releaseId}/cover`,
        coverData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      ),
    );
    return response.data;
  }

  async addSongsToRelease(
    artistId: string,
    releaseId: string,
    songData: { songIds: string[] },
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        `/artists/${artistId}/releases/${releaseId}/songs`,
        songData,
      ),
    );
    return response.data;
  }

  async removeSongsFromRelease(
    artistId: string,
    releaseId: string,
    songData: { songIds: string[] },
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.delete(
        `/artists/${artistId}/releases/${releaseId}/songs`,
        { data: songData },
      ),
    );
    return response.data;
  }
}
