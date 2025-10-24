import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SocialLinksDto, UpdateBioDto } from './update-bio.dto';

describe('UpdateBioDto', () => {
  it('should validate a valid DTO with bio only', async () => {
    const dto = plainToInstance(UpdateBioDto, {
      bio: 'This is a test biography.',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.bio).toBe('This is a test biography.');
  });

  it('should validate a valid DTO with social links', async () => {
    const dto = plainToInstance(UpdateBioDto, {
      bio: 'This is a test biography.',
      socialLinks: {
        instagram: 'https://instagram.com/test',
        twitter: 'https://twitter.com/test',
        facebook: 'https://facebook.com/test',
        youtube: 'https://youtube.com/test',
        spotify: 'https://open.spotify.com/artist/test',
        website: 'https://test.com',
      },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.socialLinks).toBeInstanceOf(SocialLinksDto);
  });

  it('should validate empty DTO', async () => {
    const dto = plainToInstance(UpdateBioDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid social links URLs', async () => {
    const dto = plainToInstance(UpdateBioDto, {
      socialLinks: {
        instagram: 'invalid-url',
        twitter: 'not-a-url',
      },
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate with multiline bio', async () => {
    const dto = plainToInstance(UpdateBioDto, {
      bio: 'Line 1\n\nLine 2 with paragraph break',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('SocialLinksDto', () => {
  it('should validate valid social links', async () => {
    const dto = plainToInstance(SocialLinksDto, {
      instagram: 'https://instagram.com/test',
      twitter: 'https://twitter.com/test',
      facebook: 'https://facebook.com/test',
      youtube: 'https://youtube.com/test',
      spotify: 'https://open.spotify.com/artist/test',
      website: 'https://test.com',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate empty social links', async () => {
    const dto = plainToInstance(SocialLinksDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid URLs', async () => {
    const dto = plainToInstance(SocialLinksDto, {
      instagram: 'not-a-url',
      website: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
