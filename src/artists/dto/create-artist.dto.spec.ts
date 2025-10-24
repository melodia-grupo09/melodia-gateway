import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateArtistDto } from './create-artist.dto';

describe('CreateArtistDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(CreateArtistDto, {
      name: 'Test Artist',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.name).toBe('Test Artist');
  });

  it('should fail validation with empty name', async () => {
    const dto = plainToInstance(CreateArtistDto, {
      name: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation with missing name', async () => {
    const dto = plainToInstance(CreateArtistDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation with non-string name', async () => {
    const dto = plainToInstance(CreateArtistDto, {
      name: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });
});
