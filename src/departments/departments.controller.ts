import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: '부서 목록 조회', description: '모든 부서 목록을 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '부서 목록 조회 성공',
    schema: {
      example: [
        { _id: 1, name: '개발팀', description: '소프트웨어 개발 담당 부서', isActive: true },
        { _id: 2, name: '영업팀', description: '영업 및 고객 관리 담당 부서', isActive: true }
      ]
    }
  })
  findAll() {
    return this.departmentsService.findAll();
  }
}

