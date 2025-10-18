import { motion } from 'framer-motion';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };
  
  return (
    <div 
      className={`flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''}`}
      onClick={handleToggle}
    >
      <motion.div
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
      
      {label && (
        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
          {label}
        </span>
      )}
    </div>
  );
};