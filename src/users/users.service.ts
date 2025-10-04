import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
} from './dto/forgot-password.dto';
import { LoginUserDto, LoginUserResponseDto } from './dto/login-user.dto';
import {
  RegisterUserDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly metricsService: MetricsService,
  ) {}

  async registerUser(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    const response = await firstValueFrom(
      this.httpService.post<string>('/auth/register', {
        email: registerUserDto.email,
        password: registerUserDto.password,
        nombre: registerUserDto.username,
      }),
    );

    // Track user registration in metrics service
    // TODO: We need to extract userId from the response or use email as identifier
    // This depends on what the user service returns
    try {
      // Assuming the response contains user data or we use email as userId
      // You might need to adjust this based on your user service response
      await this.metricsService.recordUserRegistration(registerUserDto.email);
    } catch (error) {
      // Metrics tracking failure shouldn't break the registration flow
      console.error('Failed to track user registration:', error);
    }

    return {
      result: response.data,
    };
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
    const response = await firstValueFrom(
      this.httpService.post<{
        message: string;
        token: string;
        user: { uid: string; email: string; nombre: string };
      }>('/auth/login', {
        email: loginUserDto.email,
        password: loginUserDto.password,
      }),
    );

    // Track user login and activity in metrics service
    try {
      const userId = response.data.user.uid || response.data.user.email;
      await Promise.all([
        this.metricsService.recordUserLogin(userId),
        this.metricsService.recordUserActivity(userId),
      ]);
    } catch (error) {
      console.error('Failed to track user login/activity:', error);
    }

    return {
      accessToken: response.data.token,
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    const response = await firstValueFrom(
      this.httpService.post<{ message: string }>('/auth/reset-password', {
        email: forgotPasswordDto.email,
      }),
    );
    return {
      message: response.data.message,
    };
  }
}
