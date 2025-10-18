import { motion } from 'framer-motion';
import { QRTemplate } from '@/lib/types';

interface TemplateOption {
  id: QRTemplate;
  name: string;
  fg: string;
  bg: string;
}

interface TemplateSelectorProps {
  selectedTemplate: QRTemplate;
  onSelectTemplate: (template: QRTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  const templates: TemplateOption[] = [
    { id: 'default', name: '默认', fg: '#000000', bg: '#ffffff' },
    { id: 'business', name: '商务', fg: '#1e40af', bg: '#ffffff' },
    { id: 'creative', name: '创意', fg: '#7e22ce', bg: '#f5f3ff' },
    { id: 'minimal', name: '简约', fg: '#1f2937', bg: '#ffffff' },
    { id: 'vibrant', name: '活力', fg: '#dc2626', bg: '#fef2f2' }
  ];
  
  return (
    <div className="mb-4 space-y-2">
      <label className="text-sm text-slate-600 dark:text-slate-400">选择模板</label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {templates.map(template => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTemplate(template.id)}
            className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div 
              className="w-10 h-10 rounded flex items-center justify-center mb-1 text-xs text-white shadow-sm"
              style={{ backgroundColor: template.fg }}
            >
              <i className="fa-qrcode"></i>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">{template.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};