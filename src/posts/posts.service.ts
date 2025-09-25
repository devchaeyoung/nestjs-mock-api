import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { SearchPostDto } from './dto/search-post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
  ) {}

  private buildUserDepartmentAggregationStages(): any[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { name: 1, email: 1, departmentId: 1 } }
          ]
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'departments',
          localField: 'user.departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          'user.department': {
            $cond: {
              if: '$department',
              then: { _id: '$department._id', name: '$department.name' },
              else: null
            }
          }
        }
      },
      { $project: { department: 0 } },
    ];
  }

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new Error('유효한 작성자 정보가 필요합니다.');
    }
    const createdPost = new this.postModel({
      ...createPostDto,
      userId: new Types.ObjectId(userId),
    });
    
    const savedPost = await createdPost.save();
    this.logger.log(`새 게시글 작성됨: ${savedPost._id}`);
    return savedPost;
  }

  async findAll(searchDto: SearchPostDto) {
    const { keyword, page = '1', limit = '10' } = searchDto;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const pipeline: any[] = [
      { $match: { status: 'published' } },
    ];

    if (keyword) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { content: { $regex: keyword, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      ...this.buildUserDepartmentAggregationStages(),
      { $sort: { createdAt: -1 } },
    );

    const [results] = await this.postModel.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ]);

    const posts = results.data;
    const total = results.totalCount[0]?.count || 0;

    return {
      data: posts.map(post => ({
        id: post._id,
        title: post.title,
        content: post.content,
        viewCount: post.viewCount,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('올바르지 않은 게시글 ID입니다.');
    }

    const [post] = await this.postModel.aggregate([
      { $match: { _id: new Types.ObjectId(id), status: 'published' } },
      ...this.buildUserDepartmentAggregationStages(),
    ]);

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.postModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    post.viewCount += 1;

    return post;
  }

  async search(keyword: string, searchDto: SearchPostDto) {
    return this.findAll({ ...searchDto, keyword });
  }
}

