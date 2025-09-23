import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchPostDto {
  @ApiPropertyOptional({
    description: '검색 키워드',
    example: '검색어'
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: '페이지 번호',
    example: '1',
    default: '1'
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    example: '10',
    default: '10'
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}

