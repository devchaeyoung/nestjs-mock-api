import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DepartmentDocument = Department & Document;

@Schema({ 
  _id: false,
  collection: 'departments'
})
export class Department {
  @ApiProperty({ description: '부서 ID', example: 1 })
  @Prop({ required: true, unique: true })
  _id: number;

  @ApiProperty({ description: '부서명', example: '개발팀' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: '부서 설명', example: '소프트웨어 개발 담당 부서' })
  @Prop({ trim: true })
  description?: string;

  @ApiProperty({ description: '부서 활성화 여부', example: true })
  @Prop({ default: true })
  isActive: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);

