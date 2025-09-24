import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { LoginUserDto, LoginUserResponseDto } from './dto/login-user.dto';
import {
  RegisterUserDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly httpService: HttpService) {}

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
    return {
      result: response.data,
    };
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
    const response = await firstValueFrom(
      this.httpService.post<{ access_token: string }>('/auth/login', {
        email: loginUserDto.email,
        password: loginUserDto.password,
      }),
    );
    return {
      accessToken: response.data.access_token,
    };
  }
}
