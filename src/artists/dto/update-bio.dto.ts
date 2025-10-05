import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

export class SocialLinksDto {
  @ApiProperty({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/brunomars',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  instagram?: string;

  @ApiProperty({
    description: 'Twitter profile URL',
    example: 'https://twitter.com/brunomars',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  twitter?: string;

  @ApiProperty({
    description: 'Facebook profile URL',
    example: 'https://facebook.com/brunomars',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  facebook?: string;

  @ApiProperty({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/brunomars',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  youtube?: string;

  @ApiProperty({
    description: 'Spotify artist URL',
    example: 'https://open.spotify.com/artist/1URnnhqYAYcrqrcwql10ft',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  spotify?: string;

  @ApiProperty({
    description: 'Official website URL',
    example: 'https://brunomars.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;
}

export class UpdateBioDto {
  @ApiProperty({
    description: 'Artist biography - supports paragraphs and line breaks',
    example:
      'Bruno Mars is an American singer, songwriter, and record producer.\n\nKnown for his stage performances, retro showmanship, and for performing in a wide range of musical styles...',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Social media links for the artist',
    type: SocialLinksDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
