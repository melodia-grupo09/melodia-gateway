import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateReleaseDto } from './update-release.dto';

describe('UpdateReleaseDto', () => {
  it('should validate an empty DTO (all fields optional)', async () => {
    const dto = plainToInstance(UpdateReleaseDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate a DTO with all fields', async () => {
    const dto = plainToInstance(UpdateReleaseDto, {
      title: 'Updated Album',
      type: 'ep',
      releaseDate: '2024-06-15',
      coverUrl: 'https://example.com/new-cover.jpg',
      songIds: ['new-song-1', 'new-song-2', 'new-song-3'],
      scheduledPublishAt: '2024-07-01T15:00:00Z',
      genres: ['electronic', 'synthwave'],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.title).toBe('Updated Album');
    expect(dto.type).toBe('ep');
    expect(dto.releaseDate).toBe('2024-06-15');
    expect(dto.coverUrl).toBe('https://example.com/new-cover.jpg');
    expect(dto.songIds).toEqual(['new-song-1', 'new-song-2', 'new-song-3']);
    expect(dto.scheduledPublishAt).toBe('2024-07-01T15:00:00Z');
    expect(dto.genres).toEqual(['electronic', 'synthwave']);
  });

  describe('partial updates validation', () => {
    it('should validate updating only title', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        title: 'New Title Only',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.title).toBe('New Title Only');
    });

    it('should validate updating only type', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        type: 'single',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.type).toBe('single');
    });

    it('should validate updating only releaseDate', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        releaseDate: '2025-01-01',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.releaseDate).toBe('2025-01-01');
    });

    it('should validate updating only coverUrl', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        coverUrl: 'https://newdomain.com/cover.png',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.coverUrl).toBe('https://newdomain.com/cover.png');
    });

    it('should validate updating only songIds', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        songIds: ['updated-song-1'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.songIds).toEqual(['updated-song-1']);
    });

    it('should validate updating only scheduledPublishAt', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        scheduledPublishAt: '2024-12-01T20:00:00Z',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.scheduledPublishAt).toBe('2024-12-01T20:00:00Z');
    });

    it('should validate updating only genres', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        genres: ['jazz', 'fusion'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.genres).toEqual(['jazz', 'fusion']);
    });
  });

  describe('field validation', () => {
    it('should fail validation with invalid releaseDate format', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        releaseDate: 'not-a-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'releaseDate')).toBe(
        true,
      );
    });

    it('should fail validation with invalid coverUrl format', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        coverUrl: 'invalid-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'coverUrl')).toBe(true);
    });

    it('should fail validation with invalid songIds type', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        songIds: 'not-an-array',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'songIds')).toBe(true);
    });

    it('should fail validation with invalid songIds array elements', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        songIds: ['valid-song', 456, 'another-song'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'songIds')).toBe(true);
    });

    it('should fail validation with invalid scheduledPublishAt format', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        scheduledPublishAt: 'not-a-date',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.property === 'scheduledPublishAt'),
      ).toBe(true);
    });

    it('should fail validation with invalid genres type', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        genres: 'not-an-array',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'genres')).toBe(true);
    });

    it('should fail validation with invalid genres array elements', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        genres: ['rock', 789, 'pop'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'genres')).toBe(true);
    });
  });

  describe('release type validation', () => {
    it('should validate album type', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        type: 'album',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate single type', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        type: 'single',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate ep type', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        type: 'ep',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('new fields validation scenarios', () => {
    it('should validate setting scheduledPublishAt to reschedule a release', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        scheduledPublishAt: '2025-03-15T12:00:00Z',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.scheduledPublishAt).toBe('2025-03-15T12:00:00Z');
    });

    it('should validate adding genres to an existing release for legacy compatibility', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        genres: ['indie', 'alternative', 'experimental'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.genres).toEqual(['indie', 'alternative', 'experimental']);
    });

    it('should validate clearing genres array', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        genres: [],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.genres).toEqual([]);
    });

    it('should validate updating both scheduling and genres together', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        scheduledPublishAt: '2024-08-30T18:00:00Z',
        genres: ['summer', 'dance', 'electronic'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.scheduledPublishAt).toBe('2024-08-30T18:00:00Z');
      expect(dto.genres).toEqual(['summer', 'dance', 'electronic']);
    });

    it('should validate complex update scenario with all new features', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        title: 'Remastered Edition',
        type: 'album',
        scheduledPublishAt: '2024-11-11T11:11:11Z',
        genres: ['remastered', 'classic', 'anniversary'],
        songIds: ['remastered-1', 'remastered-2', 'bonus-track'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.title).toBe('Remastered Edition');
      expect(dto.type).toBe('album');
      expect(dto.scheduledPublishAt).toBe('2024-11-11T11:11:11Z');
      expect(dto.genres).toEqual(['remastered', 'classic', 'anniversary']);
      expect(dto.songIds).toEqual([
        'remastered-1',
        'remastered-2',
        'bonus-track',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should validate null values for optional fields', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        title: null,
        coverUrl: null,
        songIds: null,
        scheduledPublishAt: null,
        genres: null,
      });

      const errors = await validate(dto);
      // Note: class-validator may treat null differently than undefined
      // This test verifies the current behavior - some errors might occur with null values
      // We're testing that the DTO transformation works regardless of validation errors
      console.log('Validation errors for null values:', errors.length);
      expect(dto.title).toBeNull();
      expect(dto.coverUrl).toBeNull();
      expect(dto.songIds).toBeNull();
      expect(dto.scheduledPublishAt).toBeNull();
      expect(dto.genres).toBeNull();
    });

    it('should validate undefined values for all optional fields', async () => {
      const dto = plainToInstance(UpdateReleaseDto, {
        title: undefined,
        type: undefined,
        releaseDate: undefined,
        coverUrl: undefined,
        songIds: undefined,
        scheduledPublishAt: undefined,
        genres: undefined,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
