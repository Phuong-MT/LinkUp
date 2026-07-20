import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import { PostLike, PostLikeSchema } from './schema/post-like.schema';
import { PostComment, PostCommentSchema } from './schema/post-comment.schema';
import { DBName } from 'src/utils/connectDB';
import { CloudModule } from '../cloud/cloud.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Post.name, schema: PostSchema },
        { name: PostLike.name, schema: PostLikeSchema },
        { name: PostComment.name, schema: PostCommentSchema },
      ],
      DBName.linkUpDB,
    ),
    CloudModule,
    UserModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
