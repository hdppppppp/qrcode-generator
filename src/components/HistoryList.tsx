import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem } from '@/lib/types';

interface HistoryListProps {
  history: HistoryItem[];
  onLoadItem: (text: string) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onLoadItem,
  onClearHistory,
  isOpen,
  onToggle
}) => {
  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onToggle}
        className="w-full px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <i className="fa-history mr-2"></i>
        {isOpen ? '隐藏历史记录' : `查看历史记录 (${history.length})`}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 max-h-60 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner"
          >
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                暂无历史记录
              </p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">最近生成的二维码</h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClearHistory}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    <i className="fa-trash mr-1"></i>清除
                  </motion.button>
                </div>
                <div className="space-y-2">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => onLoadItem(item.text)}
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};