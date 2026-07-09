import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DBName } from 'src/utils/connectDB';
import { Post, PostDocument } from './schema/post.schema';
import { CloudService, UploadFile } from '../cloud/cloud.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name, DBName.linkUpDB)
    private readonly postModel: Model<PostDocument>,
    private readonly cloudService: CloudService,
  ) {}

  async uploadMedia(file: UploadFile, resourceType: 'image' | 'video') {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const result = await this.cloudService.uploadFile(file, {
        folder: 'posts',
        resourceType,
        eager: [{ fetch_format: 'auto', quality: 'auto' }],
      });

      let secureUrl = result.url;
      if (
        secureUrl &&
        secureUrl.includes('cloudinary.com') &&
        !secureUrl.includes('f_auto,q_auto')
      ) {
        secureUrl = secureUrl.replace('/upload/', '/upload/f_auto,q_auto/');
      }

      let thumbnail: string | undefined;
      if (resourceType === 'video' && secureUrl) {
        // Generate a thumbnail URL by changing the file extension to .jpg in the Cloudinary URL
        thumbnail = secureUrl.replace(/\.[^/.]+$/, '.jpg');
      }

      return {
        type: resourceType,
        url: secureUrl,
        width: result.width,
        height: result.height,
        duration: result.duration,
        thumbnail,
      };
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : typeof error === 'string'
            ? error
            : 'Cloud upload failed';
      throw new BadRequestException(`Media upload failed: ${errorMessage}`);
    }
  }

  async createPost(authorId: string, postData: Partial<Post>): Promise<PostDocument> {
    // Generate unique slug from content or default
    const contentExcerpt = postData.content
      ? postData.content
          .trim()
          .toLowerCase()
          .normalize('NFD') // Remove diacritics
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)
      : 'post';

    const uniqueId = Math.random().toString(36).substring(2, 8);
    const slug = `${contentExcerpt || 'post'}-${uniqueId}`;

    const newPost = new this.postModel({
      ...postData,
      authorId: new Types.ObjectId(authorId),
      slug,
    });

    return newPost.save();
  }

  async findAll(limit = 10, skip = 0): Promise<PostDocument[]> {
    return this.postModel
      .find({ status: 'active' })
      .populate('authorId', 'username profile')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}
