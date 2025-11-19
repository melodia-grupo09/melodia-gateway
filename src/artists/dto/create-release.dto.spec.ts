import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReleaseDto } from './create-release.dto';

describe('CreateReleaseDto', () => {
  it('should validate a valid DTO with all required fields', async () => {
    const dto = plainToInstance(CreateReleaseDto, {
      title: 'Test Album',
      type: 'album',
      releaseDate: '2024-01-15',
      artistId: 'artist-123',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.title).toBe('Test Album');
    expect(dto.type).toBe('album');
    expect(dto.releaseDate).toBe('2024-01-15');
    expect(dto.artistId).toBe('artist-123');
  });

  it('should validate a valid DTO with all fields including optional ones', async () => {
    const dto = plainToInstance(CreateReleaseDto, {
      title: 'Test Album',
      type: 'album',
      releaseDate: '2024-01-15',
      artistId: 'artist-123',
      coverUrl: 'https://example.com/cover.jpg',
      songIds: ['song-1', 'song-2'],
      scheduledPublishAt: '2024-02-01T10:00:00Z',
      genres: ['rock', 'pop'],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.title).toBe('Test Album');
    expect(dto.type).toBe('album');
    expect(dto.releaseDate).toBe('2024-01-15');
    expect(dto.artistId).toBe('artist-123');
    expect(dto.coverUrl).toBe('https://example.com/cover.jpg');
    expect(dto.songIds).toEqual(['song-1', 'song-2']);
    expect(dto.scheduledPublishAt).toBe('2024-02-01T10:00:00Z');
    expect(dto.genres).toEqual(['rock', 'pop']);
  });

  describe('required fields validation', () => {
    it('should fail validation with missing title', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'title')).toBe(true);
    });

    it('should fail validation with empty title', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: '',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'title')).toBe(true);
    });

    it('should fail validation with missing type', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'type')).toBe(true);
    });

    it('should fail validation with missing releaseDate', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'releaseDate')).toBe(
        true,
      );
    });
  });

  describe('field type validation', () => {
    it('should fail validation with invalid releaseDate format', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: 'invalid-date',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'releaseDate')).toBe(
        true,
      );
    });

    it('should fail validation with invalid coverUrl format', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        coverUrl: 'not-a-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'coverUrl')).toBe(true);
    });

    it('should fail validation with invalid songIds type', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        songIds: 'not-an-array',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'songIds')).toBe(true);
    });

    it('should fail validation with invalid songIds array elements', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        songIds: ['valid-song', 123, 'another-song'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'songIds')).toBe(true);
    });
  });

  describe('new fields validation (scheduledPublishAt and genres)', () => {
    it('should validate scheduledPublishAt as optional field', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.scheduledPublishAt).toBeUndefined();
    });

    it('should validate valid scheduledPublishAt date string', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        scheduledPublishAt: '2024-02-01T10:00:00Z',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.scheduledPublishAt).toBe('2024-02-01T10:00:00Z');
    });

    it('should fail validation with invalid scheduledPublishAt format', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        scheduledPublishAt: 'invalid-date-format',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.property === 'scheduledPublishAt'),
      ).toBe(true);
    });

    it('should validate genres as optional field', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.genres).toBeUndefined();
    });

    it('should validate valid genres array', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        genres: ['rock', 'pop', 'latin'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.genres).toEqual(['rock', 'pop', 'latin']);
    });

    it('should fail validation with invalid genres type', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        genres: 'not-an-array',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'genres')).toBe(true);
    });

    it('should fail validation with invalid genres array elements', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        genres: ['rock', 123, 'pop'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'genres')).toBe(true);
    });

    it('should validate empty genres array', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        genres: [],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.genres).toEqual([]);
    });
  });

  describe('release type validation', () => {
    it('should validate album type', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate single type', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test Single',
        type: 'single',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate ep type', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Test EP',
        type: 'ep',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('legacy compatibility scenarios', () => {
    it('should support creating release without genres for legacy compatibility', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Legacy Album',
        type: 'album',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        songIds: ['song-1', 'song-2'],
        coverUrl: 'https://example.com/cover.jpg',
        // No genres provided - should work for legacy compatibility
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.genres).toBeUndefined();
    });

    it('should support scheduling functionality with scheduledPublishAt', async () => {
      const dto = plainToInstance(CreateReleaseDto, {
        title: 'Scheduled Release',
        type: 'single',
        releaseDate: '2024-01-15',
        artistId: 'artist-123',
        scheduledPublishAt: '2024-12-25T00:00:00Z', // Christmas release
        genres: ['holiday', 'pop'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.scheduledPublishAt).toBe('2024-12-25T00:00:00Z');
      expect(dto.genres).toEqual(['holiday', 'pop']);
    });
  });
});
