import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectConnection()
    private connection: Connection,
    private departmentsService: DepartmentsService,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();
    
    try {
      const existingUser = await this.userModel.findOne({
        email: registerDto.email
      }).session(session);

      if (existingUser) {
        throw new ConflictException('이미 존재하는 이메일입니다.');
      }

      const department = await this.departmentsService.findById(registerDto.departmentId);
      if (!department || !department.isActive) {
        throw new BadRequestException('존재하지 않거나 비활성화된 부서입니다.');
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
      
      const createdUser = new this.userModel({
        ...registerDto,
        password: hashedPassword,
      });

      const savedUser = await createdUser.save({ session });
      await session.commitTransaction();
      
      this.logger.log(`새 사용자 생성됨: ${savedUser.email}`);
      return savedUser;
      
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`사용자 생성 실패: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('+password');
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();
    
    try {
      const result = await this.userModel.findByIdAndDelete(id).session(session);
      if (!result) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      
      await this.connection.collection('posts').deleteMany({ userId: id }, { session });
      
      await session.commitTransaction();
      this.logger.log(`사용자 및 관련 데이터 삭제됨: ${id}`);
      
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`사용자 삭제 실패: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { 
      lastLoginAt: new Date() 
    });
  }
}

