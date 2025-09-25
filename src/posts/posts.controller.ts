import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiParam, 
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '게시글 작성', description: '새로운 게시글을 작성합니다.' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ 
    status: 201, 
    description: '게시글 작성 성공'
  })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user._id);
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회', description: '게시글 목록을 페이징하여 조회합니다.' })
  findAll(@Query() searchDto: SearchPostDto) {
    return this.postsService.findAll(searchDto);
  }

  @Get('search')
  @ApiOperation({ summary: '게시글 검색', description: '키워드로 게시글을 검색합니다.' })
  search(@Query('keyword') keyword: string, @Query() searchDto: SearchPostDto) {
    return this.postsService.search(keyword, searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회', description: 'ID로 특정 게시글을 조회합니다.' })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}

