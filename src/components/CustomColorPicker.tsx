import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const defaultColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b', '#4ecdc4',
  '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff',
  '#5f27cd', '#00d2d3', '#ff9f43', '#ee5253', '#10ac84'
];

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ 
  value, 
  onChange, 
  label 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  
  useEffect(() => {
    setCustomColor(value);
  }, [value]);
  
  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };
  
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };
  
  const handleCustomColorApply = () => {
    onChange(customColor);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: value }}
        />
        
        <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">
          {value.toUpperCase()}
        </span>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-3">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">选择颜色</h4>
              
              <div className="grid grid-cols-5 gap-2 mb-3">
                {defaultColors.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full ${
                      value === color ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-8 h-8 border border-slate-300 dark:border-slate-600 rounded overflow-hidden"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="text-sm w-full px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="#FFFFFF"
                    maxLength={7}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCustomColorApply}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  确定
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};