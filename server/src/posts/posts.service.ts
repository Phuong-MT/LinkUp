import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DBName } from 'src/utils/connectDB';
import { Post, PostDocument } from './schema/post.schema';
import {
  MAX_COMMENT_PER_BUCKET,
  PostComment,
  PostCommentDocument,
} from './schema/post-comment.schema';
import { CloudService, UploadFile } from '../cloud/cloud.service';

export interface PopulatedCommentItem {
  commentId: Types.ObjectId;
  authorId: {
    _id: string;
    username: string;
    profile?: {
      fullName?: string;
      avatar?: string;
    };
  };
  content: string;
  likeCount: number;
  replies: unknown[];
  replyCount: number;
  status: string;
  createdAt: Date;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name, DBName.linkUpDB)
    private readonly postModel: Model<PostDocument>,
    @InjectModel(PostComment.name, DBName.linkUpDB)
    private readonly postCommentModel: Model<PostCommentDocument>,
    private readonly cloudService: CloudService,
  ) {}

  async uploadMedia(
    file: UploadFile,
    resourceType: 'image' | 'video',
    arg?: {
      folder?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const extendFoler = arg?.folder || '';
    try {
      const result = await this.cloudService.uploadFile(file, {
        folder: extendFoler + '/' + 'posts',
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

  async addComment(postId: string, authorId: string, content: string) {
    const filter: Record<string, unknown> = { postId: new Types.ObjectId(postId) };
    let latestBucket = await this.postCommentModel.findOne(filter).sort({ bucket: -1 }).exec();

    if (!latestBucket || latestBucket.count >= MAX_COMMENT_PER_BUCKET) {
      const nextBucketNum = latestBucket ? latestBucket.bucket + 1 : 0;
      latestBucket = new this.postCommentModel({
        postId: new Types.ObjectId(postId),
        bucket: nextBucketNum,
        comments: [],
        count: 0,
      });
    }

    const commentId = new Types.ObjectId();
    const newComment = {
      commentId,
      authorId: new Types.ObjectId(authorId),
      content,
      mentions: [],
      likeCount: 0,
      replies: [],
      replyCount: 0,
      status: 'active' as const,
      createdAt: new Date(),
    };

    latestBucket.comments.push(newComment);
    latestBucket.count += 1;
    await latestBucket.save();

    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    const query: Record<string, unknown> = {
      postId: new Types.ObjectId(postId),
      bucket: latestBucket.bucket,
    };
    const updatedBucket = await this.postCommentModel
      .findOne(query)
      .populate('comments.authorId', 'username profile')
      .exec();

    const created = updatedBucket?.comments.find(
      (c) => String(c.commentId) === commentId.toHexString(),
    );
    return created;
  }

  async getComments(postId: string): Promise<PopulatedCommentItem[]> {
    const filter: Record<string, unknown> = { postId: new Types.ObjectId(postId) };
    const buckets = await this.postCommentModel
      .find(filter)
      .populate('comments.authorId', 'username profile')
      .sort({ bucket: 1 })
      .exec();

    const allComments: PopulatedCommentItem[] = [];
    for (const b of buckets) {
      const activeComments = b.comments.filter((c) => c.status === 'active');
      for (const c of activeComments) {
        allComments.push(c as unknown as PopulatedCommentItem);
      }
    }

    return allComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
