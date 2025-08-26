import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import type { UUID } from 'crypto';

export class BaseEntityDTO {
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the entity',
  })
  @IsString()
  id: UUID;
}
