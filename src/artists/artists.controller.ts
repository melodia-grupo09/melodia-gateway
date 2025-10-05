import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HttpErrorInterceptor } from '../users/interceptors/http-error.interceptor';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { UpdateBioDto } from './dto/update-bio.dto';

@ApiTags('artists')
@UseInterceptors(HttpErrorInterceptor)
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new artist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Artist data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the artist',
          example: 'J Balvin',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Artist profile image',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Artist created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 409,
    description: 'Artist name already exists',
  })
  async createArtist(
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile() image?: any,
  ): Promise<any> {
    const formData = new FormData();
    formData.append('name', createArtistDto.name);

    if (
      image &&
      typeof image === 'object' &&
      'buffer' in image &&
      'originalname' in image
    ) {
      const imageFile = image as { buffer: Buffer; originalname: string };
      const blob = new Blob([new Uint8Array(imageFile.buffer)]);
      formData.append('image', blob, imageFile.originalname);
    }

    return this.artistsService.createArtist(formData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artist by ID' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Artist found',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async getArtist(@Param('id') id: string): Promise<any> {
    return this.artistsService.getArtist(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update artist information' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Artist updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async updateArtist(
    @Param('id') id: string,
    @Body() updateArtistDto: UpdateArtistDto,
  ): Promise<any> {
    return this.artistsService.updateArtist(id, updateArtistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete artist' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Artist deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async deleteArtist(@Param('id') id: string): Promise<any> {
    return this.artistsService.deleteArtist(id);
  }

  @Patch(':id/bio')
  @ApiOperation({ summary: 'Update artist bio and social links' })
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Bio updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async updateArtistBio(
    @Param('id') id: string,
    @Body() updateBioDto: UpdateBioDto,
  ): Promise<any> {
    return this.artistsService.updateArtistBio(id, updateBioDto);
  }

  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update artist profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async updateArtistImage(
    @Param('id') id: string,
    @UploadedFile() image: any,
  ): Promise<any> {
    const formData = new FormData();

    if (
      image &&
      typeof image === 'object' &&
      'buffer' in image &&
      'originalname' in image
    ) {
      const imageFile = image as { buffer: Buffer; originalname: string };
      const blob = new Blob([new Uint8Array(imageFile.buffer)]);
      formData.append('image', blob, imageFile.originalname);
    }

    return this.artistsService.updateArtistImage(id, formData);
  }

  @Patch(':id/cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Update artist cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Artist UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Cover updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  async updateArtistCover(
    @Param('id') id: string,
    @UploadedFile() cover: any,
  ): Promise<any> {
    const formData = new FormData();

    if (
      cover &&
      typeof cover === 'object' &&
      'buffer' in cover &&
      'originalname' in cover
    ) {
      const coverFile = cover as { buffer: Buffer; originalname: string };
      const blob = new Blob([new Uint8Array(coverFile.buffer)]);
      formData.append('cover', blob, coverFile.originalname);
    }

    return this.artistsService.updateArtistCover(id, formData);
  }
}
