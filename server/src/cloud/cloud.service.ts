export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  duration?: number;
  resourceType: string;
}

export interface UploadFile {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
}

export abstract class CloudService {
  abstract uploadFile(
    file: UploadFile,
    options?: {
      folder?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: unknown;
      eager?: unknown;
    },
  ): Promise<UploadResult>;

  abstract deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<unknown>;

  // Tiện ích upload hình ảnh nhanh
  async uploadImage(file: UploadFile, folder?: string): Promise<UploadResult> {
    return this.uploadFile(file, { folder, resourceType: 'image' });
  }

  // Tiện ích upload video nhanh
  async uploadVideo(file: UploadFile, folder?: string): Promise<UploadResult> {
    return this.uploadFile(file, { folder, resourceType: 'video' });
  }

  // Tiện ích upload và resize hình ảnh
  async uploadImageWithResize(
    file: UploadFile,
    width: number,
    height: number,
    folder?: string,
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      folder,
      resourceType: 'image',
      transformation: [{ width, height, crop: 'limit' }],
    });
  }
}
