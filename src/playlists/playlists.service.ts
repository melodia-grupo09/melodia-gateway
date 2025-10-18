import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlaylistsService {
  constructor(private readonly httpService: HttpService) {}

  // Service methods will be implemented in the next step
}