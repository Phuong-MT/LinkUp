import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostLikeDocument = PostLike & Document;
export const MAX_LIKES_PER_BUCKET = 1000;

@Schema({ _id: false })
export class LikeItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const LikeItemSchema = SchemaFactory.createForClass(LikeItem);

@Schema({
  timestamps: true, // Tự động quản lý createdAt và updatedAt cho bucket
})
export class PostLike {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId!: Types.ObjectId;

  // Số thứ tự của bucket (0, 1, 2...). Bucket lớn nhất là bucket mới nhất.
  @Prop({ type: Number, required: true, default: 0 })
  bucket!: number;

  // Mảng chứa tối đa 1000 lượt like
  @Prop({ type: [LikeItemSchema], default: [] })
  likes!: LikeItem[];

  // Số lượng like hiện tại trong riêng bucket này (từ 0 -> 1000)
  @Prop({ type: Number, required: true, default: 0 })
  count!: number;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

// Chỉ mục kết hợp để đảm bảo tính duy nhất của bucket cho mỗi postId
PostLikeSchema.index({ postId: 1, bucket: 1 }, { unique: true });
// Index này tối ưu cho việc kiểm tra: "User X đã like bài viết Y chưa?"
PostLikeSchema.index({ postId: 1, 'likes.userId': 1 });
