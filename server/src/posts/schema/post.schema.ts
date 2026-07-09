import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ _id: false })
export class Media {
  @Prop({ type: String, enum: ['image', 'video'], required: true })
  type!: 'image' | 'video';

  @Prop({ required: true })
  url!: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  duration?: number; // Chỉ áp dụng nếu type là 'video'

  @Prop()
  thumbnail?: string; // Ảnh đại diện, chỉ áp dụng nếu type là 'video'
}

export const MediaSchema = SchemaFactory.createForClass(Media);

@Schema({
  timestamps: true, // Tự động tạo và cập nhật 2 trường: createdAt và updatedAt
})
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  // Nội dung bài viết hỗ trợ HTML, Markdown, và các định dạng khác. Có thể để trống nếu bài viết chỉ chứa media.
  @Prop({ default: '' })
  content?: string;

  // Hỗ trợ SEO và tạo đường dẫn đẹp
  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ type: [MediaSchema], default: [] })
  media!: Media[];

  // Quản lý quyền riêng tư nâng cao
  @Prop({
    type: String,
    enum: ['public', 'friends', 'private', 'custom'],
    default: 'public',
  })
  visibility!: 'public' | 'friends' | 'private' | 'custom';

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  visibleToIds!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  hiddenFromIds!: Types.ObjectId[];

  // Trạng thái bài viết
  @Prop({
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active',
  })
  status!: 'active' | 'hidden' | 'deleted';

  // Cấu hình tương tác
  @Prop({ type: Boolean, default: true })
  allowComment!: boolean;

  @Prop({ type: Boolean, default: true })
  allowShare!: boolean;

  // --- CẤU HÌNH PHỤC VỤ TÍNH NĂNG SHARE ---
  @Prop({ type: Boolean, default: false })
  isShared!: boolean; // Xác định bài viết này có phải là bài share lại không

  @Prop({ type: Types.ObjectId, ref: 'Post', default: null })
  originalPostId?: Types.ObjectId; // Link tới bài viết gốc

  // Bộ đếm dữ liệu (Tối ưu hóa cho tác vụ Đọc - Read-heavy)
  @Prop({ type: Number, default: 0 })
  likeCount!: number;

  @Prop({ type: Number, default: 0 })
  commentCount!: number;

  @Prop({ type: Number, default: 0 })
  shareCount!: number;

  // Phân loại và Gắn thẻ
  @Prop({ type: [String], default: [] })
  tags!: string[]; // Lưu các hashtag dưới dạng chữ thường (lowercase) để dễ tìm kiếm

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mentions!: Types.ObjectId[]; // Danh sách ID người dùng được tag trong bài viết

  // Các mốc thời gian
  @Prop({ type: Date, default: null })
  editedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  publishedAt!: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// 1. Tải News Feed chung: Tìm các bài viết active, công khai và sắp xếp từ mới đến cũ
PostSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
// 2. Tải Trang cá nhân (Profile): Tìm bài viết của một User cụ thể, sắp xếp từ mới đến cũ
PostSchema.index({ authorId: 1, publishedAt: -1 });
// 3. Tìm kiếm bài viết theo Hashtag nhanh chóng
PostSchema.index({ tags: 1, status: 1 });
