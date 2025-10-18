/**
 * 二维码模板类型
 */
export type QRTemplate = 'default' | 'business' | 'creative' | 'minimal' | 'vibrant';

/**
 * 二维码图案类型
 */
export type QRPattern = 'square' | 'circle' | 'diamond';

/**
 * 二维码输出格式
 */
export type QRFormat = 'png' | 'jpg' | 'svg';

/**
 * 二维码配置接口
 */
export interface QRConfig {
  text: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  patternType: QRPattern;
  outputFormat: QRFormat;
}

/**
 * 历史记录项接口
 */
export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}