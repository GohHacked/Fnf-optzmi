export interface OptimizationConfig {
  scale: number;
  quality: number;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
}

export interface OptimizedResult {
  blob: Blob;
  originalSize: number;
  optimizedSize: number;
  url: string;
  width: number;
  height: number;
}
