import { validate } from 'class-validator';
import { SearchPlaylistsDto } from './search-playlists.dto';

describe('SearchPlaylistsDto', () => {
  let dto: SearchPlaylistsDto;

  beforeEach(() => {
    dto = new SearchPlaylistsDto();
  });

  it('should be valid with default values', async () => {
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should be valid with search parameter', async () => {
    dto.search = 'rock music';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('rock music');
  });

  it('should be valid with custom page and limit', async () => {
    dto.page = 2;
    dto.limit = 20;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });

  it('should be valid with user_id parameter', async () => {
    dto.user_id = 'user123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.user_id).toBe('user123');
  });

  it('should be valid with all parameters', async () => {
    dto.search = 'jazz';
    dto.page = 3;
    dto.limit = 50;
    dto.user_id = 'user456';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('jazz');
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(50);
    expect(dto.user_id).toBe('user456');
  });

  it('should fail validation when page is less than 1', async () => {
    dto.page = 0;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.min).toContain('Page must be at least 1');
  });

  it('should fail validation when limit is less than 1', async () => {
    dto.limit = 0;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.min).toContain('Limit must be at least 1');
  });

  it('should fail validation when limit is greater than 100', async () => {
    dto.limit = 101;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.max).toContain('Limit must be at most 100');
  });

  it('should fail validation when page is not an integer', async () => {
    (dto as any).page = 1.5;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isInt).toContain(
      'Page must be an integer number',
    );
  });

  it('should fail validation when limit is not an integer', async () => {
    (dto as any).limit = 10.5;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isInt).toContain(
      'Limit must be an integer number',
    );
  });

  it('should fail validation when search is not a string', async () => {
    (dto as any).search = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toContain(
      'Search must be a string',
    );
  });

  it('should fail validation when user_id is not a string', async () => {
    (dto as any).user_id = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toContain(
      'User ID must be a string',
    );
  });

  it('should be valid when search is undefined', async () => {
    dto.search = undefined;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid when user_id is undefined', async () => {
    dto.user_id = undefined;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid when search is empty string', async () => {
    dto.search = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
