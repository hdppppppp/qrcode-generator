import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CustomFileUploadProps {
  label?: string;
  onChange: (file: File) => void;
  onRemove?: () => void;
  currentFile?: File | null;
  accept?: string;
  maxSize?: number; // in bytes
}

export const CustomFileUpload: React.FC<CustomFileUploadProps> = ({
  label,
  onChange,
  onRemove,
  currentFile,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (accept && !file.type.match(accept.replace(/\*/g, '.*'))) {
        toast('请选择有效的文件类型', { type: 'error' });
        return;
      }
      
      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        toast(`文件大小不能超过${maxSizeMB}MB`, { type: 'error' });
        return;
      }
      
      onChange(file);
      
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          {label}
        </label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {currentFile ? (
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
              <i className="fa-solid fa-image text-blue-500 dark:text-blue-400"></i>
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs">
                {currentFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(currentFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRemove}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            aria-label="移除文件"
          >
            <i className="fa-times"></i>
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUploadClick}
          className="w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <i className="fa-cloud-arrow-up text-xl text-slate-400 dark:text-slate-500"></i>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              点击上传文件
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              支持 JPG, PNG, GIF 等格式 (最大 {maxSize / (1024 * 1024)} MB)
            </p>
          </div>
        </motion.button>
      )}
    </div>
  );
};