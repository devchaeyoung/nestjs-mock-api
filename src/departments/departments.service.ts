import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './entities/department.entity';

@Injectable()
export class DepartmentsService implements OnModuleInit {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  async onModuleInit() {
    await this.initializeDepartments();
  }

  private async initializeDepartments() {
    try {
      const departments = [
        { _id: 1, name: '개발팀', description: '소프트웨어 개발 담당 부서', isActive: true },
        { _id: 2, name: '영업팀', description: '영업 및 고객 관리 담당 부서', isActive: true },
        { _id: 3, name: '마케팅팀', description: '마케팅 및 홍보 담당 부서', isActive: true },
        { _id: 4, name: '인사팀', description: '인사 관리 담당 부서', isActive: true },
        { _id: 5, name: '재무팀', description: '재무 및 회계 담당 부서', isActive: true },
      ];

      for (const dept of departments) {
        await this.departmentModel.findOneAndUpdate(
          { _id: dept._id },
          dept,
          { upsert: true, new: true }
        );
      }
      
      this.logger.log('부서 데이터 초기화 완료');
    } catch (error) {
      this.logger.error('부서 초기화 실패:', error as any);
    }
  }

  async findAll(): Promise<Department[]> {
    return this.departmentModel
      .find({ isActive: true })
      .sort({ _id: 1 })
      .exec();
  }

  async findById(id: number): Promise<DepartmentDocument | null> {
    if (!id || isNaN(id)) {
      throw new BadRequestException('올바른 부서 ID를 입력해주세요.');
    }
    
    return this.departmentModel.findOne({ _id: id, isActive: true }).exec();
  }
}

