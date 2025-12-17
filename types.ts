export type Language = 'en' | 'ru';

export type AssetMode = 'character' | 'background' | 'icon' | 'shader' | 'audio' | 'zip';

export interface OptimizationConfig {
  scale: number;
  quality: number;
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  mode: AssetMode;
  removeBlack: boolean;
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

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface Translation {
  title: string;
  dropZone: string; // Kept for compatibility if needed, but mostly unused now
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
  removeBlack: string;
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
  // New buttons
  uploadSpriteBtn: string;
  uploadSpriteDesc: string;
  uploadZipBtn: string;
  uploadZipDesc: string;
  // Presets
  presetsTitle: string;
  presetHigh: string;
  presetBalanced: string;
  presetPerf: string;
  presetPotato: string;
  // Admin & Maintenance
  menuUpdate: string;
  menuAdmin: string;
  loginTitle: string;
  emailPlaceholder: string;
  passPlaceholder: string;
  btnLogin: string;
  adminPanelTitle: string;
  maintenanceMode: string;
  maintenanceOn: string;
  maintenanceOff: string;
  maintenanceDesc: string;
  logout: string;
  maintenanceScreenTitle: string;
  maintenanceScreenDesc: string;
  adminAccess: string;
  // DB
  dbTitle: string;
  dbStatusLocal: string;
  dbStatusConnected: string;
  dbDesc: string;
  dbConnectBtn: string;
  dbDisconnectBtn: string;
  dbProjectPlaceholder: string;
  dbApiKeyPlaceholder: string;
  dbFindKeys: string;
}