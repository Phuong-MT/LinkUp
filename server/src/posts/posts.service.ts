import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { DBName } from 'src/utils/connectDB';
import { Post, PostDocument } from './schema/post.schema';
import {
  MAX_COMMENT_PER_BUCKET,
  PostComment,
  PostCommentDocument,
} from './schema/post-comment.schema';
import { MAX_LIKES_PER_BUCKET, PostLike, PostLikeDocument } from './schema/post-like.schema';
import { CloudService, UploadFile } from '../cloud/cloud.service';
import { UserService } from '../user/user.service';

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
    @InjectModel(PostLike.name, DBName.linkUpDB)
    private readonly postLikeModel: Model<PostLikeDocument>,
    @InjectConnection(DBName.linkUpDB)
    private readonly connection: Connection,
    private readonly cloudService: CloudService,
    private readonly userService: UserService,
  ) {}

  async extractMentions(authorId: string, content?: string): Promise<Types.ObjectId[]> {
    if (!content) return [];
    // Extract unique usernames from @username patterns (word characters)
    const regex = /@([a-zA-Z0-9_]+)/g;
    const usernames = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      usernames.add(match[1]);
    }
    if (usernames.size === 0) return [];
    return this.userService.findFriendIdsByUsernames(authorId, Array.from(usernames));
  }

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

    const mentions = await this.extractMentions(authorId, postData.content);

    const newPost = new this.postModel({
      ...postData,
      authorId: new Types.ObjectId(authorId),
      slug,
      mentions,
    });

    return newPost.save();
  }

  async findAll(limit = 10, skip = 0, userId?: string): Promise<any[]> {
    const posts = await this.postModel
      .find({ status: 'active' })
      .populate('authorId', 'username profile')
      .populate({
        path: 'originalPostId',
        populate: { path: 'authorId', select: 'username profile' },
      })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    if (!userId) {
      return posts.map((post) => ({
        ...post.toObject(),
        hasLiked: false,
      }));
    }

    const postIds = posts.map((p) => p._id);
    const likes = await this.postLikeModel.find(
      {
        postId: { $in: postIds },
        'likes.userId': new Types.ObjectId(userId),
      },
      { postId: 1 },
    );

    const likedPostIds = new Set(likes.map((l) => String(l.postId)));

    return posts.map((post) => ({
      ...post.toObject(),
      hasLiked: likedPostIds.has(String(post._id)),
    }));
  }

  async toggleLikePost(
    postId: string,
    userId: string,
  ): Promise<{ hasLiked: boolean; likeCount: number }> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. Check if user already liked the post
      const existingLikeBucket = await this.postLikeModel
        .findOne({
          postId: new Types.ObjectId(postId),
          'likes.userId': new Types.ObjectId(userId),
        })
        .session(session);

      if (existingLikeBucket) {
        // Unlike flow
        await this.postLikeModel.updateOne(
          { _id: existingLikeBucket._id },
          {
            $pull: { likes: { userId: new Types.ObjectId(userId) } },
            $inc: { count: -1 },
          },
          { session },
        );

        const updatedPost = await this.postModel
          .findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { returnDocument: 'after' })
          .session(session);

        await session.commitTransaction();

        return {
          hasLiked: false,
          likeCount: updatedPost?.likeCount || 0,
        };
      }

      // Like flow: Find latest bucket
      let latestBucket = await this.postLikeModel
        .findOne({ postId: new Types.ObjectId(postId) })
        .sort({ bucket: -1 })
        .session(session)
        .exec();

      if (!latestBucket || latestBucket.count >= MAX_LIKES_PER_BUCKET) {
        const nextBucketNum = latestBucket ? latestBucket.bucket + 1 : 0;
        latestBucket = new this.postLikeModel({
          postId: new Types.ObjectId(postId),
          bucket: nextBucketNum,
          likes: [],
          count: 0,
        });
      }

      latestBucket.likes.push({
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
      latestBucket.count += 1;
      await latestBucket.save({ session });

      const updatedPost = await this.postModel
        .findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }, { returnDocument: 'after' })
        .session(session);

      await session.commitTransaction();

      return {
        hasLiked: true,
        likeCount: updatedPost?.likeCount || 0,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async addComment(postId: string, authorId: string, content: string) {
    const mentions = await this.extractMentions(authorId, content);

    let retries = 3;
    while (retries > 0) {
      const session = await this.connection.startSession();
      session.startTransaction();
      try {
        const filter: Record<string, unknown> = { postId: new Types.ObjectId(postId) };
        let latestBucket = await this.postCommentModel
          .findOne(filter)
          .sort({ bucket: -1 })
          .session(session)
          .exec();

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
          mentions,
          likeCount: 0,
          replies: [],
          replyCount: 0,
          status: 'active' as const,
          createdAt: new Date(),
        };

        latestBucket.comments.push(newComment);
        latestBucket.count += 1;
        await latestBucket.save({ session });

        await this.postModel
          .findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })
          .session(session);

        await session.commitTransaction();

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
      } catch (error: unknown) {
        await session.abortTransaction();
        const err = error as { errorLabels?: string[]; code?: number; codeName?: string };
        const isTransient =
          err.errorLabels?.includes('TransientTransactionError') ||
          err.code === 112 ||
          err.codeName === 'WriteConflict';
        if (isTransient && retries > 1) {
          retries--;
          await new Promise((resolve) => setTimeout(resolve, 50));
          continue;
        }
        throw error;
      } finally {
        await session.endSession();
      }
    }
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

  async sharePost(
    postId: string,
    userId: string,
    caption?: string,
  ): Promise<{ sharedPost: any; targetPostId: Types.ObjectId; sharesCount: number }> {
    const mentions = await this.extractMentions(userId, caption || '');
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1. Verify original post
      const originalPost = await this.postModel.findById(postId).session(session).exec();
      if (!originalPost) {
        throw new BadRequestException('Original post not found');
      }

      // If the post being shared is already a shared post, we share the original post directly.
      const targetPostId =
        originalPost.isShared && originalPost.originalPostId
          ? originalPost.originalPostId
          : originalPost._id;

      // 2. Increment shareCount on the target post
      const updatedOriginal = await this.postModel
        .findByIdAndUpdate(
          targetPostId,
          { $inc: { shareCount: 1 } },
          { returnDocument: 'after', session },
        )
        .exec();

      // 3. Create unique slug
      const contentExcerpt = caption
        ? caption
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50)
        : 'shared';
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const slug = `${contentExcerpt || 'shared'}-${uniqueId}`;

      // 4. Create the shared post document
      const sharedPost = new this.postModel({
        authorId: new Types.ObjectId(userId),
        content: caption || '',
        slug,
        isShared: true,
        originalPostId: targetPostId,
        media: [],
        status: 'active',
        mentions,
      });

      await sharedPost.save({ session });

      await session.commitTransaction();

      // 5. Populate and return
      const populated = await this.postModel
        .findById(sharedPost._id)
        .populate('authorId', 'username profile')
        .populate({
          path: 'originalPostId',
          populate: { path: 'authorId', select: 'username profile' },
        })
        .exec();

      return {
        sharedPost: populated,
        targetPostId,
        sharesCount: updatedOriginal?.shareCount || 0,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
