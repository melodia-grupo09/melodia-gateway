import { validate } from 'class-validator';
import { ListUsersDto } from './list-users.dto';

describe('ListUsersDto', () => {
  let dto: ListUsersDto;

  beforeEach(() => {
    dto = new ListUsersDto();
  });

  it('should be valid with default values', async () => {
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should be valid with custom page and limit', async () => {
    dto.page = 2;
    dto.limit = 20;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });

  it('should be valid with search parameter', async () => {
    dto.search = 'john';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('john');
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (dto as any).page = 1.5;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isInt).toContain('Page must be an integer');
  });

  it('should fail validation when limit is not an integer', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (dto as any).limit = 10.5;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isInt).toContain('Limit must be an integer');
  });

  it('should fail validation when search is not a string', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (dto as any).search = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toContain(
      'Search must be a string',
    );
  });

  it('should be valid when search is undefined', async () => {
    dto.search = undefined;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid when search is empty string', async () => {
    dto.search = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
