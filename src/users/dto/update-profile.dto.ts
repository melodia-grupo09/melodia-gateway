import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Carlos Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre_completo?: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+54911234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Av. Corrientes 1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({
    description: 'Biografía del usuario',
    example: 'Músico profesional...',
    required: false,
  })
  @IsOptional()
  @IsString()
  biografia?: string;

  @ApiProperty({
    description: 'Filtro de contenido habilitado',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  filtro_contenido?: boolean;
}
