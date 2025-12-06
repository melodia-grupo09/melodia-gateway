import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({
    description: 'Whether the user should be an artist or not',
    example: true,
  })
  @IsBoolean()
  esArtista: boolean;
}
