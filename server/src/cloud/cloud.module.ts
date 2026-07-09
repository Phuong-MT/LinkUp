import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { CloudService } from './cloud.service';

@Module({
  providers: [
    CloudinaryProvider,
    {
      provide: CloudService,
      useClass: CloudinaryService,
    },
  ],
  exports: [CloudService],
})
export class CloudModule {}
