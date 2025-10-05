import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly metricsService: MetricsService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/auth/register', {
        email: registerUserDto.email,
        password: registerUserDto.password,
        nombre: registerUserDto.username,
      }),
    );

    try {
      await this.metricsService.recordUserRegistration(registerUserDto.email);
    } catch (error) {
      console.error('Failed to track user registration:', error);
    }

    return response.data;
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<any> {
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
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/auth/reset-password', {
        email: forgotPasswordDto.email,
      }),
    );
    return response.data;
  }
}
