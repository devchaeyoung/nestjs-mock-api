import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
})
export class User {
  @ApiProperty({ description: '사용자 ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: '부서 ID', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'Department', required: true, index: true })
  departmentId: Types.ObjectId;

  @ApiProperty({ description: '생성일시', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ departmentId: 1 });

