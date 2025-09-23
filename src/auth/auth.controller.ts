import { Controller, Post, Body, UseGuards, Request, Delete, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '토큰 갱신' })
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('withdraw')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원탈퇴' })
  async withdraw(@Request() req) {
    return this.authService.withdraw(req.user._id);
  }
}

