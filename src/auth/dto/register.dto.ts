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
    description: '부서 번호 (1: 개발팀, 2: 영업팀, 3: 마케팅팀, 4: 인사팀, 5: 재무팀)',
    example: 1,
    minimum: 1
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  departmentId: number;
}

