import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ArtistDTO } from './artist.dto';
import { UploadSongDTO } from './upload-song.dto';

describe('UploadSongDTO', () => {
  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      title: 'Test Song',
      artists: [{ id: '123', name: 'Test Artist' }],
      albumId: 'album-123',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should handle string JSON artists transformation', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      title: 'Test Song',
      artists: '[{"id": "123", "name": "Test Artist"}]',
      albumId: 'album-123',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.artists).toHaveLength(1);
    expect(dto.artists[0]).toBeInstanceOf(ArtistDTO);
    expect(dto.artists[0].id).toBe('123');
    expect(dto.artists[0].name).toBe('Test Artist');
  });

  it('should handle array artists transformation', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      title: 'Test Song',
      artists: [{ id: '123', name: 'Test Artist' }],
      albumId: 'album-123',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.artists).toHaveLength(1);
    expect(dto.artists[0]).toBeInstanceOf(ArtistDTO);
  });

  it('should handle invalid JSON string artists', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      title: 'Test Song',
      artists: 'invalid json',
      albumId: 'album-123',
    });

    expect(dto.artists).toEqual([]);
  });

  it('should handle empty artists array', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      title: 'Test Song',
      artists: [],
      albumId: 'album-123',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.artists).toEqual([]);
  });

  it('should validate without optional albumId', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      title: 'Test Song',
      artists: [{ id: '123', name: 'Test Artist' }],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with missing title', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      artists: [{ id: '123', name: 'Test Artist' }],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('should fail validation with missing artists', async () => {
    const dto = plainToInstance(UploadSongDTO, {
      title: 'Test Song',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('artists');
  });
});
