import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from '../departments/departments.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private departmentsService: DepartmentsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const department = await this.departmentsService.findById(user.departmentId);
    
    const { password, ...result } = (user as any).toObject ? (user as any).toObject() : user;
    this.logger.log(`새 사용자 등록: ${user.email}`);
    
    return {
      ...result,
      department: department ? { _id: (department as any)._id, name: (department as any).name } : null
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUser(
      loginDto.email, 
      loginDto.password
    );
    
    if (!user) {
      this.logger.warn(`로그인 실패: ${loginDto.email}`);
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    await this.usersService.updateLastLogin((user as any)._id);

    const department = await this.departmentsService.findById(user.departmentId);
    const payload = { 
      email: user.email, 
      sub: (user as any)._id,
      departmentId: user.departmentId 
    };
    
    this.logger.log(`사용자 로그인: ${user.email}`);
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id,
        email: user.email,
        name: user.name,
        departmentId: user.departmentId,
        department: department ? { _id: (department as any)._id, name: (department as any).name } : null
      },
    };
  }

  async withdraw(userId: string) {
    await this.usersService.remove(userId);
    this.logger.log(`사용자 탈퇴: ${userId}`);
    return { message: '회원탈퇴가 완료되었습니다.' };
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    const department = await this.departmentsService.findById(user.departmentId);
    
    const payload = { 
      email: user.email, 
      sub: (user as any)._id,
      departmentId: user.departmentId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id,
        email: user.email,
        name: user.name,
        departmentId: user.departmentId,
        department: department ? { _id: (department as any)._id, name: (department as any).name } : null
      },
    };
  }
}

