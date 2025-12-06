import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    minLength: 3,
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email format is invalid' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  /**
   * Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character
   */
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/,
    {
      message:
        'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'User country',
    example: 'Argentina',
  })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @ApiProperty({
    description: 'Whether the user is an artist',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isArtist must be a boolean' })
  isArtist?: boolean;
}

export class RegisterUserResponseDto {
  @ApiProperty({
    description: 'Result string from external service',
    example: 'User created successfully',
  })
  result?: string;
  status?: string;
  message?: string;
  code?: string;
}
