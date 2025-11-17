import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeRoleDto {
  @ApiProperty({
    description: 'Si el usuario debe ser artista o no',
    example: true,
  })
  @IsBoolean()
  esArtista: boolean;
}
