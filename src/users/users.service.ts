import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ArtistsService } from '../artists/artists.service';
import admin from '../auth/firebase';
import { MetricsService } from '../metrics/metrics.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
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

  async refreshToken(authHeader?: string): Promise<any> {
    console.log('Starting refresh token process...');

    if (!authHeader) {
      throw new HttpException(
        'Authorization header is required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const currentToken = authHeader.replace('Bearer ', '');
      console.log('Token extracted, length:', currentToken.length);

      if (
        process.env.NODE_ENV === 'development' ||
        !process.env.FIREBASE_SERVICE_ACCOUNT
      ) {
        console.log('Running in development mode - simulating token refresh');

        const tokenParts = currentToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }

        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString(),
        ) as { user_id?: string; sub?: string; email?: string };
        console.log('Token decoded successfully');

        const result = {
          message: 'Token refreshed successfully (dev mode)',
          token: 'dev-refreshed-token-' + Date.now(),
          user: {
            uid: payload.user_id || payload.sub || '',
            email: payload.email || '',
            nombre: payload.email?.split('@')[0] || 'Developer',
            esArtista: false,
          },
        };

        console.log('Refresh completed successfully');
        return result;
      }

      console.log('Running in production mode with Firebase');
      const decodedToken = await admin
        .auth()
        .verifyIdToken(currentToken, false);
      const uid = decodedToken.uid;
      const email = decodedToken.email;

      const userInfo = await admin.auth().getUser(uid);
      const customToken = await admin.auth().createCustomToken(uid);

      console.log('Firebase token refresh completed successfully');

      return {
        message: 'Token refreshed successfully',
        token: customToken,
        user: {
          uid: userInfo.uid,
          email: userInfo.email,
          nombre: userInfo.displayName || email?.split('@')[0] || 'User',
          esArtista: false,
        },
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new HttpException(
        'Unable to refresh token - please login again',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
