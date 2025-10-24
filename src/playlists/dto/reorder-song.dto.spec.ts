import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ReorderSongDto } from './reorder-song.dto';

describe('ReorderSongDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(ReorderSongDto, {
      song_id: 'song-123',
      position: 5,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.song_id).toBe('song-123');
    expect(dto.position).toBe(5);
  });

  it('should fail validation with missing song_id', async () => {
    const dto = plainToInstance(ReorderSongDto, {
      position: 5,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('song_id');
  });

  it('should fail validation with missing position', async () => {
    const dto = plainToInstance(ReorderSongDto, {
      song_id: 'song-123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('position');
  });

  it('should fail validation with non-string song_id', async () => {
    const dto = plainToInstance(ReorderSongDto, {
      song_id: 123,
      position: 5,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('song_id');
  });

  it('should fail validation with non-number position', async () => {
    const dto = plainToInstance(ReorderSongDto, {
      song_id: 'song-123',
      position: 'not-a-number',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('position');
  });

  it('should validate with position 0', async () => {
    const dto = plainToInstance(ReorderSongDto, {
      song_id: 'song-123',
      position: 0,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
