import { OptimizationConfig, OptimizedResult } from '../types';

export const optimizeImage = (
  file: File,
  config: OptimizationConfig
): Promise<OptimizedResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions
      const width = Math.round(img.width * config.scale);
      const height = Math.round(img.height * config.scale);

      canvas.width = width;
      canvas.height = height;

      // Better scaling quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              originalSize: file.size,
              optimizedSize: blob.size,
              url: URL.createObjectURL(blob),
              width,
              height
            });
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        config.format,
        config.quality
      );
    };

    reader.readAsDataURL(file);
  });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};