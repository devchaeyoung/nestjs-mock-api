import { Controller, Post, Body, UseGuards, Request, Delete, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';

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
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    // Set refresh token as HttpOnly Secure SameSite cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
    });
    return { access_token: result.access_token, user: result.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '토큰 갱신' })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const payload = this.authService.verifyRefreshToken(refreshToken);
    const result = await this.authService.refreshToken(payload.sub);
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return { access_token: result.access_token, user: result.user };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('withdraw')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원탈퇴' })
  async withdraw(@Request() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.withdraw(req.user._id);
    res.clearCookie('refresh_token', { path: '/' });
    return result;
  }
}

