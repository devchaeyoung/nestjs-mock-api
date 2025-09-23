import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123'
  })
  @IsString()
  password: string;
}

