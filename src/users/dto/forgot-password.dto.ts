import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ForgotPasswordResponseDto {
  message: string;
}
