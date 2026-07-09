import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostCommentDocument = PostComment & Document;
export const MAX_COMMENT_PER_BUCKET = 100;

@Schema({ _id: false })
export class Reply {
  @Prop({
    type: Types.ObjectId,
    required: true,
    default: () => new Types.ObjectId(),
  })
  replyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: String, default: null })
  media?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mentions!: Types.ObjectId[]; // Tag trong reply

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  replyToUserId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  likeCount!: number;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);

@Schema({ _id: false })
export class CommentItem {
  @Prop({
    type: Types.ObjectId,
    required: true,
    default: () => new Types.ObjectId(),
  })
  commentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: String, default: null })
  media?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mentions!: Types.ObjectId[]; // Tag trong comment cấp 1

  @Prop({ type: Number, default: 0 })
  likeCount!: number;

  // Nhúng mảng replies cấp 2 trực tiếp vào comment cấp 1 tương ứng
  @Prop({ type: [ReplySchema], default: [] })
  replies!: Reply[];

  @Prop({ type: Number, default: 0 })
  replyCount!: number;

  @Prop({
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active',
  })
  status!: 'active' | 'hidden' | 'deleted';

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const CommentItemSchema = SchemaFactory.createForClass(CommentItem);

@Schema({
  timestamps: true, // Theo dõi thời gian tạo và cập nhật của cả bucket
})
export class PostComment {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId!: Types.ObjectId;

  // Số thứ tự của bucket (0, 1, 2...). Bucket lớn nhất chứa các comment mới nhất.
  @Prop({ type: Number, required: true, default: 0 })
  bucket!: number;

  // Mảng gom các bình luận cấp 1 lại với nhau (Giới hạn ví dụ: 100 items)
  @Prop({ type: [CommentItemSchema], default: [] })
  comments!: CommentItem[];

  // Số lượng comment cấp 1 hiện tại đang có trong riêng bucket này (0 -> 100)
  @Prop({ type: Number, required: true, default: 0 })
  count!: number;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

// Chỉ mục kết hợp để đảm bảo tính duy nhất của bucket cho mỗi postId
PostCommentSchema.index({ postId: 1, bucket: 1 }, { unique: true });
