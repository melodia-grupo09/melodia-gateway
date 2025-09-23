import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  RegisterUserDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';

interface FastApiUserResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly httpService: HttpService) {}

  async registerUser(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    try {
      // TODO Update the correct user service URL
      const response = await firstValueFrom(
        this.httpService.post<FastApiUserResponse>('/users/register', {
          username: registerUserDto.username,
          email: registerUserDto.email,
          password: registerUserDto.password,
        }),
      );

      this.logger.log('User registered successfully via microservice');

      return {
        id: response.data.id,
        username: registerUserDto.username,
        email: response.data.email,
        createdAt: response.data.created_at,
      };
    } catch (error) {
      this.logger.error('Error registering user:', error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          throw new ConflictException('Email already registered');
        }
        if (error.response?.status === 400) {
          const errorMessage = (error.response.data as { message?: string })
            ?.message;
          throw new BadRequestException(errorMessage || 'Invalid user data');
        }
      }

      throw new BadRequestException('Error registering user');
    }
  }
}
