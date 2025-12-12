import { IsEmail, IsString, MinLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호 (최소 6자)',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '부서 ID (ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  departmentId: string;
}

