import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
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
    description: 'Login successful',
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
  @ApiOperation({ summary: 'Register a new user' })
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
  @ApiOperation({ summary: 'Refresh expired token' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (can be expired)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        message: 'Token refreshed successfully',
        token: 'eyJhbGciOiJSUzI1NiIs...',
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
    status: 401,
    description: 'Unable to refresh token - login required',
    schema: {
      example: {
        status: 'error',
        message: 'Refresh token expired - please login again',
        code: 'refresh_required',
      },
    },
  })
  async refreshToken(
    @Headers('authorization') authHeader: string,
  ): Promise<any> {
    return this.usersService.refreshToken(authHeader);
  }
}
