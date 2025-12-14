export type Language = 'en' | 'ru';

export type AssetMode = 'character' | 'background' | 'icon' | 'shader' | 'audio' | 'zip';

export interface OptimizationConfig {
  scale: number;
  quality: number;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  mode: AssetMode;
}

export interface OptimizedResult {
  blob: Blob;
  xmlBlob?: Blob; // For characters
  textData?: string; // For shaders
  originalSize: number;
  optimizedSize: number;
  url: string;
  xmlUrl?: string;
  width?: number;
  height?: number;
  isZip?: boolean;
}

export interface Translation {
  title: string;
  dropZone: string;
  dropXml: string;
  dragActive: string;
  modeChar: string;
  modeBg: string;
  modeIcon: string;
  modeShader: string;
  modeZip: string;
  scale: string;
  quality: string;
  format: string;
  btnOptimize: string;
  btnOptimizing: string;
  success: string;
  downloadImg: string;
  downloadXml: string;
  downloadZip: string;
  saved: string;
  reset: string;
  errorXmlMissing: string;
  infoRam: string;
  infoRamDesc: string;
  infoSpeed: string;
  infoSpeedDesc: string;
  infoCompat: string;
  infoCompatDesc: string;
  shaderFix: string;
  menuInfoTitle: string;
  menuWhyOptimize: string;
  menuWhyOptimizeDesc: string;
  menuFeatures: string;
  menuFeat1: string;
  menuFeat2: string;
  menuFeat3: string;
  menuZipSupport: string;
  menuZipSupportDesc: string;
}