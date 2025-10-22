import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ArtistsService } from '../artists/artists.service';

import { MetricsService } from '../metrics/metrics.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly metricsService: MetricsService,
    private readonly artistsService: ArtistsService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<any> {
    let response;

    try {
      response = await firstValueFrom(
        this.httpService.post('/auth/register', {
          email: registerUserDto.email,
          password: registerUserDto.password,
          nombre: registerUserDto.username,
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
            message: 'Registration failed',
            code: 'registration_failed',
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
    if (registerUserDto.isArtist === true && response.data?.user?.uid) {
      try {
        const formData = new FormData();
        formData.append('id', response.data.user.uid);
        formData.append('name', registerUserDto.username);

        const artistResponse = await this.artistsService.createArtist(formData);
        console.log('Artist profile created:', artistResponse);

        // Add artist info to the response
        return {
          ...response.data,
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
      ...response.data,
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
      let errorMsg = '';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: unknown } } })
          .response?.data?.message === 'string'
      ) {
        errorMsg = (error as { response: { data: { message: string } } })
          .response.data.message;
      }
      if (
        typeof errorMsg === 'string' &&
        (errorMsg.toLowerCase().includes('password') ||
          errorMsg.toLowerCase().includes('contraseña'))
      ) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Incorrect password',
            code: 'incorrect_password',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        typeof errorMsg === 'string' &&
        (errorMsg.toLowerCase().includes('not found') ||
          errorMsg.toLowerCase().includes('no existe'))
      ) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Email not found',
            code: 'email_not_found',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          {
            status: 'error',
            message: 'Login failed',
            code: 'login_failed',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
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
}
