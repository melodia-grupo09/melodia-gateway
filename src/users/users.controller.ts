import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ListUsersDto } from './dto/list-users.dto';
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

  // Admin endpoints
  @Post('admin/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new admin user',
    description: 'Register a new administrator account',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email already registered',
  })
  async adminRegister(
    @Body() adminRegisterDto: AdminRegisterDto,
  ): Promise<any> {
    return this.usersService.adminRegister(adminRegisterDto);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description: 'Login with admin credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin login successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
  })
  async adminLogin(@Body() adminLoginDto: AdminLoginDto): Promise<any> {
    return this.usersService.adminLogin(adminLoginDto);
  }

  @Post('admin/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin password reset',
    description: 'Request password reset for admin account',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
  })
  async adminResetPassword(
    @Body() adminResetPasswordDto: AdminResetPasswordDto,
  ): Promise<any> {
    return this.usersService.adminResetPassword(adminResetPasswordDto);
  }

  @Get('admin/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all users',
    description: 'Get paginated list of all users (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async listUsers(@Query() listUsersDto: ListUsersDto): Promise<any> {
    return this.usersService.listUsers(listUsersDto);
  }

  @Post('admin/users/:userId/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Block a user',
    description: 'Block a user account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User blocked successfully',
  })
  async blockUser(@Param('userId') userId: string): Promise<any> {
    return this.usersService.blockUser(userId);
  }

  @Post('admin/users/:userId/unblock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unblock a user',
    description: 'Unblock a user account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User unblocked successfully',
  })
  async unblockUser(@Param('userId') userId: string): Promise<any> {
    return this.usersService.unblockUser(userId);
  }

  @Delete('admin/users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Delete a user account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  async deleteUser(@Param('userId') userId: string): Promise<any> {
    return this.usersService.deleteUser(userId);
  }
}
