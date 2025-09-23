import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @ApiProperty({ description: '게시글 ID', example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ description: '게시글 제목', example: '게시글 제목입니다' })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({ description: '게시글 내용', example: '게시글 내용입니다' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: '작성자 ID', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: '게시글 상태', example: 'published' })
  @Prop({ 
    enum: ['draft', 'published', 'archived'], 
    default: 'published',
    index: true 
  })
  status: string;

  @ApiProperty({ description: '조회수', example: 0 })
  @Prop({ default: 0, min: 0 })
  viewCount: number;

  @ApiProperty({ description: '생성일시', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ status: 1, createdAt: -1 });

