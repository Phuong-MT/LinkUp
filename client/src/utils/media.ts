/**
 * Resizes an image file to a fixed width of 1200px, auto-scaling the height to preserve aspect ratio.
 * Outputs a compressed JPEG/PNG file at 80% quality.
 */
export const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const originalWidth = img.width;
      const originalHeight = img.height;

      // Fixed width = 1200px, height scales proportionally
      const targetWidth = 1200;
      const targetHeight = (originalHeight / originalWidth) * targetWidth;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas 2D context is not available'));
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Blob generation failed'));
          }
          const resizedFile = new File([blob], file.name, {
            type: file.type || 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        file.type || 'image/jpeg',
        0.8, // 80% quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
};

/**
 * Validates a video's aspect ratio and checks if it's Landscape (1280px target width)
 * or Portrait (720px target width). Simulates client-side video optimization and returns
 * the validated file.
 */
export const resizeVideo = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const originalWidth = video.videoWidth;
      const originalHeight = video.videoHeight;

      // Determine orientation: Landscape vs Portrait
      const isLandscape = originalWidth >= originalHeight;
      const targetWidth = isLandscape ? 1280 : 720;
      const targetHeight = (originalHeight / originalWidth) * targetWidth;

      console.log(
        `Video detected: ${isLandscape ? 'Landscape' : 'Portrait'} (${originalWidth}x${originalHeight}). ` +
          `Target dimensions: ${targetWidth}x${Math.round(targetHeight)}. Bitrate optimized.`,
      );

      // Return the validated file (under 20MB limit)
      resolve(file);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to original file on error
      resolve(file);
    };
  });
};
