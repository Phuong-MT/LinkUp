import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Post as PostSchema } from './schema/post.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const mimetype = file.mimetype || '';
    const size = file.size || 0;

    let resourceType: 'image' | 'video';
    if (mimetype.startsWith('image/')) {
      if (size > 5 * 1024 * 1024) {
        throw new BadRequestException('Image file size exceeds the 5MB limit');
      }
      resourceType = 'image';
    } else if (mimetype.startsWith('video/')) {
      if (size > 20 * 1024 * 1024) {
        throw new BadRequestException('Video file size exceeds the 20MB limit');
      }
      resourceType = 'video';
    } else {
      throw new BadRequestException(
        'Unsupported media file type. Only images and videos are allowed.',
      );
    }

    return this.postsService.uploadMedia(file, resourceType);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(
    @Req() req: { user?: { userId?: string } },
    @Body() postData: Partial<PostSchema>,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.postsService.createPost(userId, postData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getPosts(@Query('limit') limit?: string, @Query('skip') skip?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    return this.postsService.findAll(limitNum, skipNum);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Req() req: { user?: { userId?: string } },
    @Param('id') postId: string,
    @Body('content') content: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    if (!content || !content.trim()) {
      throw new BadRequestException('Comment content cannot be empty');
    }
    return this.postsService.addComment(postId, userId, content);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/comments')
  async getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }
}
