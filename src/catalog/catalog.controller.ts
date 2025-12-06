import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { CatalogService, CatalogPayload } from './catalog.service';

type CatalogQuery = Record<string, string | string[] | undefined>;

@Controller('catalog')
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
    return this.catalogService.getCatalogItem(kind, id);
  }

  @Patch(':kind/:id')
  async updateCatalogItem(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Body() payload: CatalogPayload,
  ): Promise<unknown> {
    return this.catalogService.updateCatalogItem(kind, id, payload);
  }

  @Post(':kind/:id/block')
  async blockCatalogItem(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Body() payload: CatalogPayload,
  ): Promise<unknown> {
    return this.catalogService.blockCatalogItem(kind, id, payload);
  }

  @Post(':kind/:id/unblock')
  async unblockCatalogItem(
    @Param('kind') kind: string,
    @Param('id') id: string,
    @Body() payload: CatalogPayload,
  ): Promise<unknown> {
    return this.catalogService.unblockCatalogItem(kind, id, payload);
  }
}
