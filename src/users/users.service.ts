import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { ArtistsService } from '../artists/artists.service';
import { FirebaseUser } from '../auth/user.decorator';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
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
import { ShareSongsDto } from './dto/share-songs.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface User {
  uid: string;
  nombre: string;
  nombre_completo: string;
  foto_perfil_url: string | null;
  esArtista: boolean;
}

interface FollowersResponse {
  followers: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => MetricsService))
    private readonly metricsService: MetricsService,
    @Inject(forwardRef(() => ArtistsService))
    private readonly artistsService: ArtistsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getUserRegion(token: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/profile/me/country', {
          params: { token },
        }),
      );
      return response.data as string;
    } catch {
      // Handle error or return default
      return 'unknown';
    }
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<any> {
    let response: {
      data: {
        user?: { uid?: string; email?: string };
        [key: string]: unknown;
      };
    };

    try {
      response = await firstValueFrom(
        this.httpService.post('/auth/register', {
          email: registerUserDto.email,
          password: registerUserDto.password,
          nombre: registerUserDto.username,
          pais: registerUserDto.country,
          esArtista: registerUserDto.isArtist,
        }),
      );
    } catch (error: unknown) {
      // Handle specific error messages from user service
      let errorMsg = '';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { detail?: unknown } } })
          .response?.data?.detail === 'string'
      ) {
        errorMsg = (error as { response: { data: { detail: string } } })
          .response.data.detail;
      }

      // Check for email already registered (Spanish message from service)
      if (
        errorMsg.includes('correo electrónico ya está registrado') ||
        (errorMsg.toLowerCase().includes('email') &&
          errorMsg.toLowerCase().includes('registered'))
      ) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Email is already registered',
            code: 'email_already_registered',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // Check for username already taken (if service ever implements this)
      else if (
        errorMsg.toLowerCase().includes('username') ||
        (errorMsg.toLowerCase().includes('nombre') &&
          errorMsg.toLowerCase().includes('existe'))
      ) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Username is already taken',
            code: 'username_already_taken',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // Generic registration error
      else {
        throw new HttpException(
          {
            status: 'error',
            message: errorMsg || 'Registration failed',
            code: 'registration_failed',
            details: errorMsg,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    try {
      await this.metricsService.recordUserRegistration(registerUserDto.email);
    } catch (error) {
      console.error('Failed to track user registration:', error);
    }

    // If user is an artist, create artist profile
    const userData = response.data as {
      user?: { uid?: string; email?: string };
      [key: string]: unknown;
    };
    if (
      registerUserDto.isArtist === true &&
      userData?.user?.uid &&
      typeof userData.user.uid === 'string'
    ) {
      const userId = userData.user.uid;
      try {
        const formData = new FormData();
        formData.append('id', userId);
        formData.append('name', registerUserDto.username);

        const artistResponse: unknown = await this.artistsService.createArtist(
          formData as unknown as globalThis.FormData,
        );
        console.log('Artist profile created:', artistResponse);

        // Record artist creation in metrics
        try {
          await this.metricsService.recordArtistCreation(userId);
        } catch (error) {
          console.error('Failed to track artist creation:', error);
        }

        // Add artist info to the response
        return {
          ...userData,
          message: 'User registered successfully',
          artist: artistResponse,
        };
      } catch (error) {
        console.error('Failed to create artist profile:', error);
        // Don't fail the user registration if artist creation fails
        // Just log the error and continue
      }
    }

    // Return response with English message
    return {
      ...userData,
      message: 'User registered successfully',
    };
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ user?: { uid?: string; email?: string } }>(
          '/auth/login',
          {
            email: loginUserDto.email,
            password: loginUserDto.password,
          },
        ),
      );

      try {
        const user = response.data?.user as
          | { uid?: string; email?: string }
          | undefined;
        const userId: string =
          (typeof user?.uid === 'string' && user.uid) ||
          (typeof user?.email === 'string' && user.email) ||
          loginUserDto.email;
        await Promise.all([
          this.metricsService.recordUserLogin(userId),
          this.metricsService.recordUserActivity(userId),
        ]);
      } catch (error) {
        console.error('Failed to track user login/activity:', error);
      }

      return response.data;
    } catch (error: unknown) {
      let errorMsg = 'Login failed';
      let statusCode = HttpStatus.BAD_REQUEST;

      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: unknown; detail?: unknown };
            status?: number;
          };
        };
        const errorData = axiosError.response?.data;

        if (axiosError.response?.status) {
          statusCode = axiosError.response.status;
        }

        if (errorData && typeof errorData.message === 'string') {
          errorMsg = errorData.message;
        } else if (errorData && typeof errorData.detail === 'string') {
          errorMsg = errorData.detail;
        }
      }

      throw new HttpException(
        {
          status: 'error',
          message: errorMsg,
          code: 'login_failed',
        },
        statusCode,
      );
    }
  }

  async loginGoogle(googleLoginDto: GoogleLoginDto): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/auth/login/google', googleLoginDto),
    );
    return response.data;
  }

  async linkGoogle(userId: string, linkGoogleDto: LinkGoogleDto): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/auth/link/google', {
        user_id: userId,
        id_token: linkGoogleDto.id_token,
      }),
    );
    return response.data;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/auth/reset-password', {
        email: forgotPasswordDto.email,
      }),
    );
    return response.data;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      // Call external user service to refresh token
      const response = await firstValueFrom(
        this.httpService.post<{
          user_id?: string;
          user?: { email?: string; nombre?: string; esArtista?: boolean };
          id_token?: string;
          refresh_token?: string;
          expires_in?: number;
        }>('/auth/refresh-token', {
          refresh_token: refreshTokenDto.refresh_token,
        }),
      );

      const refreshData = response.data;

      // Get user data from the refresh response
      const userEmail =
        typeof refreshData.user?.email === 'string'
          ? refreshData.user.email
          : '';
      const userName =
        (typeof refreshData.user?.nombre === 'string' &&
          refreshData.user.nombre) ||
        (userEmail ? userEmail.split('@')[0] : '') ||
        '';

      const user = {
        uid: typeof refreshData.user_id === 'string' ? refreshData.user_id : '',
        email: userEmail,
        nombre: userName,
        esArtista: refreshData.user?.esArtista === true,
      };

      return {
        message: 'Token refreshed successfully',
        id_token:
          typeof refreshData.id_token === 'string' ? refreshData.id_token : '',
        refresh_token:
          typeof refreshData.refresh_token === 'string'
            ? refreshData.refresh_token
            : '',
        expires_in:
          typeof refreshData.expires_in === 'number'
            ? refreshData.expires_in
            : 0,
        user,
      };
    } catch (error: unknown) {
      console.error('Error refreshing token:', error);

      if (typeof error === 'object' && error !== null && 'response' in error) {
        const httpError = error as {
          response?: { status?: number; data?: { detail?: string } };
        };

        if (httpError.response?.status === 401) {
          throw new UnauthorizedException({
            status: 'error',
            message: 'Invalid or expired refresh token',
            code: 'unauthorized',
          });
        }
      }

      throw new BadRequestException({
        status: 'error',
        message: 'Unable to refresh token - please try again',
        code: 'refresh_failed',
      });
    }
  }

  // Admin methods
  async adminRegister(adminRegisterDto: AdminRegisterDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/admin/register', {
          email: adminRegisterDto.email,
          password: adminRegisterDto.password,
          nombre: adminRegisterDto.nombre,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error registering admin:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Admin registration failed',
          code: 'admin_registration_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async adminLogin(adminLoginDto: AdminLoginDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/admin/login', {
          email: adminLoginDto.email,
          password: adminLoginDto.password,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error admin login:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Admin login failed',
          code: 'admin_login_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async adminResetPassword(
    adminResetPasswordDto: AdminResetPasswordDto,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('/admin/reset-password', {
          email: adminResetPasswordDto.email,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error admin reset password:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Admin password reset failed',
          code: 'admin_reset_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async listUsers(listUsersDto: ListUsersDto): Promise<any> {
    try {
      const params: Record<string, any> = {
        page: listUsersDto.page,
        limit: listUsersDto.limit,
      };
      if (listUsersDto.search) {
        params.search = listUsersDto.search;
      }

      const response = await firstValueFrom(
        this.httpService.get('/admin/users', { params }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error listing users:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to list users',
          code: 'list_users_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async blockUser(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/admin/users/${userId}/block`),
      );
      // Set cache with 1 year TTL (in milliseconds) to avoid immediate expiration if 0 is treated as 0ms
      await this.cacheManager.set(
        `blocked_user:${userId}`,
        true,
        365 * 24 * 60 * 60 * 1000,
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error blocking user:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to block user',
          code: 'block_user_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async unblockUser(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/admin/users/${userId}/unblock`),
      );
      await this.cacheManager.del(`blocked_user:${userId}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error unblocking user:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to unblock user',
          code: 'unblock_user_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/admin/users/${userId}`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to delete user',
          code: 'delete_user_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // New admin methods
  async changeUserRole(
    userId: string,
    changeRoleDto: ChangeRoleDto,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`/admin/users/${userId}/role`, changeRoleDto),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error changing user role:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to change user role',
          code: 'change_role_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/admin/users/profile/${userId}`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting user details:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get user details',
          code: 'get_user_details_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Profile methods
  async searchUsers(searchUsersDto: SearchUsersDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/profile/search', {
          params: {
            query: searchUsersDto.query,
            page: searchUsersDto.page,
            limit: searchUsersDto.limit,
          },
        }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error searching users:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to search users',
          code: 'search_users_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getProfile(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/profile/${userId}`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting profile:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get profile',
          code: 'get_profile_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`/profile/${userId}`, updateProfileDto),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to update profile',
          code: 'update_profile_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadProfilePhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      const formData = new FormData();

      // Append the file buffer directly to FormData
      const multerFile = file as unknown as {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
      };

      formData.append('file', multerFile.buffer, {
        filename: multerFile.originalname,
        contentType: multerFile.mimetype,
      });

      const response = await firstValueFrom(
        this.httpService.post(`/profile/${userId}/photo`, formData, {
          headers: formData.getHeaders() as Record<string, string>,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error uploading profile photo:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to upload profile photo',
          code: 'upload_photo_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPublicProfile(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/profile/public/${userId}`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting public profile:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get public profile',
          code: 'get_public_profile_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async followUser(userId: string, followerUserId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/profile/${followerUserId}/follow/${userId}`),
      );

      // Send notification to the followed user (non-blocking)
      this.sendFollowNotification(userId, followerUserId).catch((error) => {
        console.error(
          `Failed to send follow notification to user ${userId}:`,
          error,
        );
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Error following user:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to follow user',
          code: 'follow_user_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Send notification to user when someone follows them (non-blocking)
   */
  private async sendFollowNotification(
    followedUserId: string,
    followerUserId: string,
  ): Promise<void> {
    try {
      // Get follower's profile to get their username
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const followerProfile = await this.getProfile(followerUserId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const followerName = followerProfile?.nombre || 'A user';

      const notificationData = {
        userId: followedUserId,
        title: 'New Follower',
        body: `${followerName} started following you`,
        data: {
          type: 'user_followed',
          createdId: followerUserId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          followerName,
        },
      };

      await this.notificationsService.sendNotificationToUserDevices(
        notificationData,
      );
    } catch (error) {
      console.error('Error sending follow notification:', error);
    }
  }

  async unfollowUser(userId: string, followerUserId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/profile/${followerUserId}/unfollow/${userId}`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error unfollowing user:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to unfollow user',
          code: 'unfollow_user_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async isFollowing(userId: string, followerUserId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/profile/${followerUserId}/is-following/${userId}`,
        ),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error checking follow status:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to check follow status',
          code: 'check_follow_status_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getFollowersCount(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/profile/${userId}/followers-count`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting followers count:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get followers count',
          code: 'get_followers_count_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getFollowingCount(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/profile/${userId}/following-count`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting following count:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get following count',
          code: 'get_following_count_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<FollowersResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/profile/${userId}/followers`, {
          params: { page, limit },
        }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting followers:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get followers',
          code: 'get_followers_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/profile/${userId}/following`, {
          params: { page, limit },
        }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting following:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get following',
          code: 'get_following_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async shareSongs(
    uid: string,
    shareSongsDto: ShareSongsDto,
    sender: FirebaseUser,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/feed/${uid}/share`, shareSongsDto),
      );

      try {
        const senderName = sender.name || 'Someone';
        await this.notificationsService.sendNotificationToUserDevices({
          userId: uid,
          title: 'New Song Shared',
          body: `${senderName} shared a song with you`,
          data: {
            type: 'SONG_SHARE',
            redirect: 'home',
          },
        });
      } catch (error) {
        console.warn(`Failed to send notification for shared song: ${error}`);
      }

      return response.data;
    } catch (error: unknown) {
      console.error('Error sharing songs:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to share songs',
          code: 'share_songs_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserFeed(uid: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/feed/${uid}`),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting user feed:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to get user feed',
          code: 'get_feed_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeSongsFromFeed(uid: string, songIds: string[]): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/feed/${uid}/songs`, {
          params: { song_ids: songIds },
        }),
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error removing songs from feed:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to remove songs from feed',
          code: 'remove_songs_failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
