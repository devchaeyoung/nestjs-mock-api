import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '게시글 제목입니다'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '게시글 내용입니다'
  })
  @IsString()
  content: string;
}

