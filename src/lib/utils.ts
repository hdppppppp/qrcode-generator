import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化时间戳为本地时间
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 验证URL格式
 * @param url 要验证的URL字符串
 * @returns 是否为有效URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 获取文件的MIME类型
 * @param format 文件格式
 * @returns MIME类型字符串
 */
export const getMimeTypeFromFormat = (format: string): string => {
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'svg': 'image/svg+xml'
  };
  
  return mimeTypes[format.toLowerCase()] || 'image/png';
};

/**
 * 安全地从localStorage获取数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 解析后的数据或默认值
 */export const safeGetFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * 安全地保存数据到localStorage
 * @param key 存储键名
 * @param value 要存储的值
 * @returns 是否保存成功
 */
export const safeSaveToLocalStorage = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error saving to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * 安全地从localStorage删除数据
 * @param key 存储键名
 * @returns 是否删除成功
 */
export const safeRemoveFromLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
};
