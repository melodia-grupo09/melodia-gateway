import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User first name',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Juan Carlos Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre_completo?: string;

  @ApiProperty({
    description: 'User email',
    example: 'juan.perez@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+54911234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({
    description: 'User address',
    example: 'Av. Corrientes 1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({
    description: 'User country',
    example: 'Argentina',
    required: false,
  })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Músico profesional...',
    required: false,
  })
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiProperty({
    description: 'Content filter enabled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  filtro_contenido?: boolean;
}
