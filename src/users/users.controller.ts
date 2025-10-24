import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { UsersService } from './users.service';

@ApiTags('users')
@UseInterceptors(HttpErrorInterceptor)
@Controller('users')
export class UsersController {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description:
      'Login successful - Returns both access token and refresh token',
    schema: {
      example: {
        message: 'Succesful Login',
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'AMf-vBywFmjorV2yrPzYrB6DkOq6mV7N870sOkhiVQ...',
        user: {
          uid: 'user123',
          email: 'user@example.com',
          nombre: 'username',
          esArtista: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials or email not found',
    schema: {
      example: {
        status: 'error',
        message: 'Incorrect credentials',
        code: 'bad_request',
      },
    },
  })
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return this.usersService.loginUser(loginUserDto);
  }
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Register a new user. If isArtist is true, an artist profile will also be created.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email already registered',
    schema: {
      example: {
        status: 'error',
        message: 'El correo electrónico ya está registrado',
        code: 'email_already_registered',
      },
    },
  })
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<any> {
    return this.usersService.registerUser(registerUserDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    schema: {
      example: {
        message: 'Password reset email sent',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email',
    schema: {
      example: {
        status: 'error',
        message: 'User not found',
        code: 'bad_request',
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<any> {
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh expired token',
    description: 'Send your refresh token to get new access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description:
      'Token refreshed successfully - Use the new tokens for future requests',
    schema: {
      example: {
        message: 'Token refreshed successfully',
        id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'AMf-vBywFmjorV2yrPzYrB6DkOq6mV7N870sOkhiVQ...',
        expires_in: '3600',
        user: {
          uid: 'user123',
          email: 'user@example.com',
          nombre: 'username',
          esArtista: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token is required',
    schema: {
      example: {
        status: 'error',
        message: 'Refresh token is required',
        code: 'bad_request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        status: 'error',
        message: 'Invalid or expired refresh token',
        code: 'unauthorized',
      },
    },
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<any> {
    return this.usersService.refreshToken(refreshTokenDto);
  }
}
