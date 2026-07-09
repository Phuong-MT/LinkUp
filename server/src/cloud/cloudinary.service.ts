import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { CloudService, UploadFile, UploadResult } from './cloud.service';

@Injectable()
export class CloudinaryService extends CloudService {
  // Hàm base upload qua stream
  private async _uploadStream(file: UploadFile, options: UploadApiOptions): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File buffer is required for upload');
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error: unknown, result?: UploadApiResponse) => {
          if (error) {
            const errorMessage =
              error && typeof error === 'object' && 'message' in error
                ? String((error as { message?: string }).message)
                : typeof error === 'string'
                  ? error
                  : 'Unknown upload error';
            return reject(error instanceof Error ? error : new Error(errorMessage));
          }
          if (!result) {
            return reject(new Error('Cloudinary upload result is undefined'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            duration: typeof result.duration === 'number' ? result.duration : undefined,
            resourceType: result.resource_type,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  // Hàm base xóa file
  private async _delete(
    publicId: string,
    options: { resource_type?: 'image' | 'video' | 'raw' },
  ): Promise<unknown> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required for deletion');
    }

    try {
      return (await cloudinary.uploader.destroy(publicId, options)) as unknown;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : typeof error === 'string'
            ? error
            : 'Unknown deletion error';
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // Hàm upload chính
  async uploadFile(
    file: UploadFile,
    options?: {
      folder?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: unknown;
    },
  ): Promise<UploadResult> {
    const uploadOptions: UploadApiOptions = {
      folder: options?.folder || 'linkup',
      resource_type: options?.resourceType || 'auto',
      transformation: options?.transformation as UploadApiOptions['transformation'],
    };
    return this._uploadStream(file, uploadOptions);
  }

  // Hàm xóa chính
  async deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<unknown> {
    return this._delete(publicId, { resource_type: resourceType || 'image' });
  }
}
