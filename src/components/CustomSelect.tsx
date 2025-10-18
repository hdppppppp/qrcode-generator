import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
  disabled = false,
  placeholder = "请选择"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  const selectedOption = options.find(option => option.value === value);
  
  return (
    <div className="w-full" ref={selectRef}>
      {label && (
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
          {label}
        </label>
      )}
      
      <motion.div
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
        onClick={handleToggle}
        className={`relative w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <div className="flex justify-between items-center">
          <span className={`text-sm ${
            selectedOption ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
          }`}>
            {selectedOption?.label || placeholder}
          </span>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400"
          >
            <i className="fa-chevron-down text-xs"></i>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
            >
              {options.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ backgroundColor: 'rgba(241, 245, 249, 1)' }}
                  className={`p-3 cursor-pointer text-sm ${
                    option.value === value 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => handleOptionSelect(option.value)}
                >
                  {option.label}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};