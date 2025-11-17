import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({
    description: 'Si el usuario debe ser artista o no',
    example: true,
  })
  @IsBoolean()
  esArtista: boolean;
}
