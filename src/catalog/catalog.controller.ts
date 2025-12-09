import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CatalogService } from './catalog.service';
import type { CatalogPayload } from './catalog.service';
import { HttpErrorInterceptor } from '../users/interceptors/http-error.interceptor';

type CatalogQuery = Record<string, string | string[] | undefined>;

function checkSong(kind: string) {
  if (kind !== 'song')
    throw new NotFoundException('Only songs are available in this service');
}

@ApiTags('catalog')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('catalog')
@UseInterceptors(HttpErrorInterceptor)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async listCatalog(@Query() query: CatalogQuery): Promise<unknown> {
    return this.catalogService.listCatalog(query);
  }

  @Get(':kind/:id')
  async getCatalogItem(
    @Param('kind') kind: string,
    @Param('id') id: string,
  ): Promise<unknown> {
    checkSong(kind);
    return this.catalogService.getCatalogItem(kind, id);
  }

  @Patch(':kind/:id')
  async updateCatalogItem(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Body() payload: CatalogPayload,
  ): Promise<unknown> {
    checkSong(kind);
    return this.catalogService.updateCatalogItem(kind, id, payload);
  }

  @Post(':kind/:id/block')
  async blockCatalogItem(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Body() payload: CatalogPayload,
  ): Promise<unknown> {
    checkSong(kind);
    return this.catalogService.blockCatalogItem(kind, id, payload);
  }

  @Post(':kind/:id/unblock')
  async unblockCatalogItem(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Body() payload: CatalogPayload,
  ): Promise<unknown> {
    checkSong(kind);
    return this.catalogService.unblockCatalogItem(kind, id, payload);
  }
}
