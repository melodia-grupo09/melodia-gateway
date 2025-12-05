import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User, type FirebaseUser } from '../auth/user.decorator';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LinkGoogleDto } from './dto/link-google.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  async loginGoogle(@Body() googleLoginDto: GoogleLoginDto): Promise<any> {
    return this.usersService.loginGoogle(googleLoginDto);
  }

  @Post('link/google')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link Google Account' })
  @ApiResponse({
    status: 200,
    description: 'Account linked successfully',
  })
  async linkGoogle(
    @User() user: FirebaseUser,
    @Body() linkGoogleDto: LinkGoogleDto,
  ): Promise<any> {
    return this.usersService.linkGoogle(user.uid, linkGoogleDto);
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

  // New admin endpoints
  @Patch('admin/users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change user role',
    description: 'Change if a user is an artist or not (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User role changed successfully',
  })
  async changeUserRole(
    @Param('userId') userId: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ): Promise<any> {
    return this.usersService.changeUserRole(userId, changeRoleDto);
  }

  @Get('admin/users/profile/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user details',
    description: 'Get complete details of a specific user (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
  })
  async getUserDetails(@Param('userId') userId: string): Promise<any> {
    return this.usersService.getUserDetails(userId);
  }

  // Profile endpoints
  @Get('profile/search')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Search users',
    description: 'Search users by name with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Users found successfully',
  })
  async searchUsers(@Query() searchUsersDto: SearchUsersDto): Promise<any> {
    return this.usersService.searchUsers(searchUsersDto);
  }

  @Get('profile/:userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get own profile',
    description: 'Get user own profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  async getProfile(@Param('userId') userId: string): Promise<any> {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile/:userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Update profile',
    description: 'Update user own profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Post('profile/:userId/photo')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload profile photo',
    description: 'Upload or update user profile photo',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile photo uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or size',
  })
  async uploadProfilePhoto(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    return this.usersService.uploadProfilePhoto(userId, file);
  }

  @Get('profile/public/:userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get public profile',
    description: 'Get public profile of another user',
  })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
  })
  async getPublicProfile(@Param('userId') userId: string): Promise<any> {
    return this.usersService.getPublicProfile(userId);
  }

  @Post('profile/:userId/follow')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Follow user',
    description: 'Follow another user',
  })
  @ApiResponse({
    status: 200,
    description: 'User followed successfully',
  })
  async followUser(
    @Param('userId') userId: string,
    @User() currentUser: FirebaseUser,
  ): Promise<any> {
    return this.usersService.followUser(userId, currentUser.uid);
  }

  @Post('profile/:userId/unfollow')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Unfollow user',
    description: 'Unfollow a user',
  })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed successfully',
  })
  async unfollowUser(
    @Param('userId') userId: string,
    @User() currentUser: FirebaseUser,
  ): Promise<any> {
    return this.usersService.unfollowUser(userId, currentUser.uid);
  }

  @Get('profile/:userId/is-following')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Check if following',
    description: 'Check if current user is following another user',
  })
  @ApiResponse({
    status: 200,
    description: 'Following status retrieved successfully',
  })
  async isFollowing(
    @Param('userId') userId: string,
    @Query('follower_user_id') followerUserId: string,
  ): Promise<any> {
    return this.usersService.isFollowing(userId, followerUserId);
  }

  @Get('profile/:userId/followers-count')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get followers count',
    description: 'Get the number of followers for a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Followers count retrieved successfully',
  })
  async getFollowersCount(@Param('userId') userId: string): Promise<any> {
    return this.usersService.getFollowersCount(userId);
  }

  @Get('profile/:userId/following-count')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get following count',
    description: 'Get the number of users being followed',
  })
  @ApiResponse({
    status: 200,
    description: 'Following count retrieved successfully',
  })
  async getFollowingCount(@Param('userId') userId: string): Promise<any> {
    return this.usersService.getFollowingCount(userId);
  }

  @Get('profile/:userId/followers')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get followers',
    description: 'Get list of user followers with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
  })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.usersService.getFollowers(userId, page, limit);
  }

  @Get('profile/:userId/following')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get following',
    description: 'Get list of users being followed with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Following list retrieved successfully',
  })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.usersService.getFollowing(userId, page, limit);
  }
}
