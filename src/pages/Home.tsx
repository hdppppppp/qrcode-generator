import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { Empty } from '@/components/Empty';
import { QRTemplate, QRPattern, QRFormat, HistoryItem } from '@/lib/types';
import { generateId, isValidUrl } from '@/lib/utils';

// 自定义组件
import { CustomColorPicker } from '@/components/CustomColorPicker';
import { CustomFileUpload } from '@/components/CustomFileUpload';
import { CustomToggle } from '@/components/CustomToggle';
import { CustomSelect } from '@/components/CustomSelect';
import { HistoryList } from '@/components/HistoryList';
import { TemplateSelector } from '@/components/TemplateSelector';

// 解析TXT配置文件
const parseConfig = (txt: string) => {
  const config: Record<string, any> = {};
  const lines = txt.split('\n');
  
  for (const line of lines) {
    // 忽略注释和空行
    if (line.trim().startsWith('#') || line.trim() === '') continue;
    
    const [key, value] = line.split('=').map(part => part.trim());
    if (key && value) {
      // 处理嵌套配置
      const keys = key.split('.');
      let current = config;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    }
  }
  
  return config;
};

// 默认配置
const defaultConfig = {
  site: {
    title: "QR Code Generator",
    description: "输入URL或文本，一键生成二维码"
  },
  footer: {
    copyright: "© {currentYear} QR Code Generator. All rights reserved.",
    tagline: "简单、高效的二维码生成工具"
  }
};

// 加载配置文件
const loadConfig = async () => {
  try {
    const response = await fetch('/src/config/appConfig.txt');
    if (response.ok) {
      const txt = await response.text();
      return parseConfig(txt);
    }
    return defaultConfig;
  } catch (error) {
    console.warn('加载配置文件失败，使用默认配置:', error);
    return defaultConfig;
  }
};

export default function Home() {
  // 基础状态
  const [inputText, setInputText] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [appConfig, setAppConfig] = useState(defaultConfig);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  
  // 新增功能状态
  const [foregroundColor, setForegroundColor] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(window.innerWidth < 640 ? 260 : 300);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoSize, setLogoSize] = useState<number>(20); // 百分比
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // 新增功能
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate>('default');
  const [patternType, setPatternType] = useState<QRPattern>('square');
  const [outputFormat, setOutputFormat] = useState<QRFormat>('png');
  const [logoBorder, setLogoBorder] = useState<number>(0);
  const [logoBorderColor, setLogoBorderColor] = useState<string>('#ffffff');
  const [logoShadow, setLogoShadow] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  const { theme, toggleTheme, isDark } = useTheme();
  
  // 初始化配置和历史记录
  useEffect(() => {
    // 加载配置文件
    const fetchConfig = async () => {
      const config = await loadConfig();
      setAppConfig(config);
    };
    
    fetchConfig();
    
    // 加载历史记录
    const savedHistory = localStorage.getItem('qrCodeHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // 确保解析结果是数组
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
        }
      } catch (error) {
        console.warn('加载历史记录失败:', error);
      }
    }
    
    // 监听窗口大小变化
    const handleResize = () => {
      if (!inputText.trim()) {
        const size = window.innerWidth < 640 ? 260 : 300;
        setQrSize(size);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 防抖处理输入
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);

    // 清除之前的定时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 设置新的定时器，延迟1秒生成二维码
    debounceTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        generateQRCode(value);
      } else {
        setQrCodeDataUrl('');
      }
    }, 1000);
  };
  
   // 保存到历史记录
  const saveToHistory = (text: string) => {
    // 检查是否已存在相同内容的记录
    const exists = history.some(item => item.text === text);
    if (exists) return;
    
    const newEntry: HistoryItem = {
      id: generateId(),
      text,
      timestamp: Date.now()
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10); // 只保留最近10条
    setHistory(updatedHistory);
    try {
      localStorage.setItem('qrCodeHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.warn('保存历史记录失败:', error);
    }
  };
  
  // 从历史记录加载
  const loadFromHistory = (text: string) => {
    setInputText(text);
    generateQRCode(text);
    setShowHistory(false);
  };
  
  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('qrCodeHistory');
    } catch (error) {
      console.warn('清除历史记录失败:', error);
    }
    toast('历史记录已清除');
  };

  // 应用模板设置
  const applyTemplate = (template: QRTemplate) => {
    switch (template) {
      case 'business':
        setForegroundColor('#1e40af');
        setBackgroundColor('#ffffff');
        setPatternType('square');
        break;
      case 'creative':
        setForegroundColor('#7e22ce');
        setBackgroundColor('#f5f3ff');
        setPatternType('circle');
        break;
      case 'minimal':
        setForegroundColor('#1f2937');
        setBackgroundColor('#ffffff');
        setPatternType('diamond');
        break;
      case 'vibrant':
        setForegroundColor('#dc2626');
        setBackgroundColor('#fef2f2');
        setPatternType('square');
        break;
      default:
        setForegroundColor(isDark ? '#ffffff' : '#000000');
        setBackgroundColor(isDark ? '#0f172a' : '#ffffff');
        setPatternType('square');
    }
  };

  // 生成二维码
  const generateQRCode = async (text: string) => {
    if (!canvasRef.current) {
      console.error('Canvas element not found');
      toast('生成失败：Canvas元素未找到', { type: 'error' });
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    try {
      // 设置canvas尺寸
      canvasRef.current.width = qrSize;
      canvasRef.current.height = qrSize;
      
      // 清空canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, qrSize, qrSize);
      }
      
      // 生成基础二维码
      await QRCode.toCanvas(canvasRef.current, text, {
        width: qrSize,
        margin: 1,
        errorCorrectionLevel,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        }
      });

      // 添加徽标
      if (logoImage) {
        await addLogoToQRCode(canvasRef.current, logoImage);
      }

      // 将Canvas转换为DataURL
      const mimeType = outputFormat === 'png' ? 'image/png' : 
                       outputFormat === 'jpg' ? 'image/jpeg' : 'image/svg+xml';
      const dataUrl = canvasRef.current.toDataURL(mimeType);
      setQrCodeDataUrl(dataUrl);
      
      // 保存到历史记录
      saveToHistory(text);
      
      // 显示生成成功提示
      toast('二维码生成成功！');
    } catch (error) {
      console.error('生成二维码失败:', error);
      toast('生成二维码失败，请重试', { type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 添加徽标到二维码
  const addLogoToQRCode = async (canvas: HTMLCanvasElement, logoFile: File) => {
    return new Promise<void>((resolve, reject) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'));
        return;
      }
      
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
          
          img.onload = () => {
            const logoWidth = (qrSize * logoSize) / 100;
            const logoHeight = logoWidth;
            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = (canvas.height - logoHeight) / 2;
            
            // 绘制背景圆圈
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, logoWidth / 2 + logoBorder + 4, 0, 2 * Math.PI);
            ctx.fillStyle = backgroundColor;
            ctx.fill();
            
            // 添加阴影
            if (logoShadow) {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
            }
            
            // 绘制Logo边框
            if (logoBorder > 0) {
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 2, logoWidth / 2 + logoBorder, 0, 2 * Math.PI);
              ctx.fillStyle = logoBorderColor;
              ctx.fill();
            }
            
            // 绘制徽标
            ctx.shadowColor = 'transparent'; // 重置阴影
            ctx.drawImage(img, logoX + logoBorder, logoY + logoBorder, 
                         logoWidth - (logoBorder * 2), logoHeight - (logoBorder * 2));
            
            resolve();
          };
          
          img.onerror = () => {
            reject(new Error('无法加载徽标图片'));
          };
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取徽标文件失败'));
      };
      
      reader.readAsDataURL(logoFile);
    });
  };
  
  // 处理徽标文件选择
  const handleLogoChange = (file: File) => {
    setLogoImage(file);
    
    // 如果已有输入内容，重新生成二维码
    if (inputText.trim()) {
      generateQRCode(inputText);
    }
  };
  
  // 移除徽标
  const removeLogo = () => {
    setLogoImage(null);
    
    // 如果已有输入内容，重新生成二维码
    if (inputText.trim()) {
      generateQRCode(inputText);
    }
  };

  // 点击生成按钮
  const handleGenerateClick = () => {
    if (inputText.trim()) {
      generateQRCode(inputText);
    }
  };

  // 复制二维码到剪贴板
  const copyToClipboard = async () => {
    if (!qrCodeDataUrl) return;

    try {
      const blob = await (await fetch(qrCodeDataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      toast('二维码已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast('复制失败，请重试', { type: 'error' });
    }
  };
  
  // 打印二维码
  const printQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>打印二维码</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: white;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                padding: 20px;
                background: #f5f5f5;
                border-radius: 10px;
                margin-bottom: 20px;
              }
              img {
                max-width: 300px;
                max-height: 300px;
              }
              .print-info {
                text-align: center;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${qrCodeDataUrl}" alt="二维码" />
            </div>
            <div class="print-info">
              <p>内容: ${inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText}</p>
              <p>打印时间: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // 主题变更时更新默认颜色
  useEffect(() => {
    if (!inputText.trim()) {
      setForegroundColor(isDark ? '#ffffff' : '#000000');
      setBackgroundColor(isDark ? '#0f172a' : '#ffffff');
    }
  }, [theme]);
  
  // 应用模板效果效果模板效果
  useEffect(() => {
    applyTemplate(selectedTemplate);
  }, [selectedTemplate]);

  // 二维码设置变更时重新生成
  useEffect(() => {
    if (inputText.trim()) {
      generateQRCode(inputText);
    }
  }, [foregroundColor, backgroundColor, qrSize, errorCorrectionLevel, logoSize, logoBorder, logoBorderColor, logoShadow]);

  // 选项数据
  const patternOptions = [
    { value: 'square', label: '方形' },
    { value: 'circle', label: '圆形' },
    { value: 'diamond', label: '菱形' }
  ];
  
  const formatOptions = [
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'svg', label: 'SVG' }
  ];
  
  const errorCorrectionOptions = [
    { value: 'L', label: 'L - 低 (7%)' },
    { value: 'M', label: 'M - 中 (15%)' },
    { value: 'Q', label: 'Q - 较高 (25%)' },
    { value: 'H', label: 'H - 高 (30%)' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
      {/* 装饰背景元素 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-3xl"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-400/10 dark:bg-purple-500/5 blur-3xl"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      {/* 头部 */}
      <motion.header 
        className="w-full max-w-2xl mb-8 flex justify-between items-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-2xl font-bold text-slate-800 dark:text-white"
          whileHover={{ scale: 1.02 }}
        >
           <motion.span
             initial={{ rotate: -10 }}
             animate={{ rotate: 0 }}
             transition={{ type: "spring", stiffness: 400, damping: 10 }}
             className="inline-block"
           >
             <i className="fa-solid fa-qrcode mr-2 text-blue-500"></i>
           </motion.span>
           {appConfig?.site?.title || defaultConfig.site.title}
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
          aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
        >
          {isDark ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <i className="fa-solid fa-sun"></i>
            </motion.span>
          ) : (
            <motion.span
              animate={{ rotate: -360 }}
              transition={{ duration: 0.5 }}
            >
              <i className="fa-solid fa-moon"></i>
            </motion.span>
          )}
        </motion.button>
      </motion.header>

      {/* 主内容区 */}
      <motion.main 
        className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 md:p-8 transition-all duration-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
        }}
      >
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          {/* 输入区域 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            <motion.h2 
              className="text-xl font-semibold text-slate-700 dark:text-slate-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
               {appConfig?.site?.description || defaultConfig.site.description}
            </motion.h2>
            
            <motion.div 
              className="relative"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <textarea
                value={inputText}
                onChange={handleInputChange}
                placeholder="https://example.com 或输入任意文本..."
                className="w-full min-h-[180px] p-5 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 text-base shadow-inner"
              />
              
              {inputText && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setInputText('')}
                  className="absolute right-4 top-4 text-xl text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors"
                  aria-label="清除输入"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </motion.button>
              )}
            </motion.div>
            
             {/* 生成按钮 */}
             <motion.button
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               whileHover={{ scale: 1.03, y: -2 }}
               whileTap={{ scale: 0.97 }}
               onClick={handleGenerateClick}
               disabled={!inputText.trim() || isGenerating}
               className={`w-full px-6 py-4 text-lg font-medium rounded-lg transition-all duration-300 flex items-center justify-center ${
                 !inputText.trim() 
                   ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400' 
                   : isGenerating
                     ? 'bg-blue-400 text-white cursor-not-allowed' 
                     : 'bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg active:scale-98'
               }`}
             >
               {isGenerating ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                   生成中...
                 </>
               ) : (
                 <>
                   <motion.span
                     animate={{ 
                       rotate: [0, 10, -10, 0],
                     }}
                     transition={{ 
                       duration: 2,
                       repeat: Infinity,
                       repeatType: "loop"
                     }}
                   >
                     <i className="fa-solid fa-magic mr-2"></i>
                   </motion.span>
                   生成二维码
                 </>
               )}
             </motion.button>
             
              {/* 二维码设置面板 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner"
              >
                <h3 className="text-md font-medium text-slate-700 dark:text-slate-200 mb-4">
                  <i className="fa-sliders-h mr-2 text-blue-500"></i>
                  二维码设置
                </h3>
                
                {/* 模板选择 */}
                <TemplateSelector 
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  {/* 前景色选择 */}
                  <div>
                    <CustomColorPicker
                      label="前景色"
                      value={foregroundColor}
                      onChange={setForegroundColor}
                    />
                  </div>
                  
                  {/* 背景色选择 */}
                  <div>
                    <CustomColorPicker
                      label="背景色"
                      value={backgroundColor}
                      onChange={setBackgroundColor}
                    />
                  </div>
                  
                  {/* 图案类型 */}
                  <div>
                    <CustomSelect
                      label="图案类型"
                      value={patternType}
                      onChange={(value) => setPatternType(value as QRPattern)}
                      options={patternOptions}
                      placeholder="选择图案类型"
                    />
                  </div>
                  
                  {/* 输出格式 */}
                  <div>
                    <CustomSelect
                      label="输出格式"
                      value={outputFormat}
                      onChange={(value) => setOutputFormat(value as QRFormat)}
                      options={formatOptions}
                      placeholder="选择输出格式"
                    />
                  </div>
                </div>
                
                {/* 尺寸调整 */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-600 dark:text-slate-400">尺寸: {qrSize}px</label>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {qrSize < 200 ? '小' : qrSize < 300 ? '中' : '大'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="20"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                
                {/* 纠错级别 */}
                <div className="mt-4">
                  <CustomSelect
                    label="纠错级别"
                    value={errorCorrectionLevel}
                    onChange={(value) => setErrorCorrectionLevel(value as 'L' | 'M' | 'Q' | 'H')}
                    options={errorCorrectionOptions}
                    placeholder="选择纠错级别"
                  />
                </div>
                
                {/* 徽标设置 */}
                <div className="mt-4">
                  <CustomFileUpload
                    label="添加徽标"
                    onChange={handleLogoChange}
                    onRemove={removeLogo}
                    currentFile={logoImage}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                  
                  {logoImage && (
                    <>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-slate-600 dark:text-slate-400">
                            徽标大小: {logoSize}%
                          </label>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="40"
                          step="2"
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                      
                      {/* Logo边框设置 */}
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-slate-600 dark:text-slate-400">
                            边框宽度: {logoBorder}px
                          </label>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={logoBorder}
                          onChange={(e) => setLogoBorder(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                      
                      {/* Logo边框颜色 */}
                      <div className="mt-2">
                        <CustomColorPicker
                          label="边框颜色"
                          value={logoBorderColor}
                          onChange={setLogoBorderColor}
                        />
                      </div>
                      
                      {/* Logo阴影 */}
                      <div className="mt-2 pt-2">
                        <CustomToggle
                          checked={logoShadow}
                          onChange={setLogoShadow}
                          label="添加阴影效果"
                        />
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
             
             {/* 历史记录 */}
             <HistoryList
               history={history}
               onLoadItem={loadFromHistory}
               onClearHistory={clearHistory}
               isOpen={showHistory}
               onToggle={() => setShowHistory(!showHistory)}
             />
            
             <motion.div 
               className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.6 }}
             >
               <div className="flex items-start">
                 <i className="fa-info-circle mt-0.5 mr-2 text-blue-500"></i>
                 <div>
                   <p className="mb-1">输入内容后将自动生成二维码，支持多种类型的内容：</p>
                   <ul className="list-disc pl-5 space-y-1 text-xs">
                     <li>网站链接 (http://, https://)</li>
                     <li>纯文本信息</li>
                     <li>联系信息 (电话、邮箱)</li>
                     <li>Wi-Fi网络配置信息</li>
                   </ul>
                 </div>
               </div>
             </motion.div>
          </motion.div>
          
          {/* 二维码显示区域 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center justify-center order-first md:order-last"
          >
            <motion.div 
              className={`relative p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl transform transition-all duration-300`}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* 装饰元素 */}
              <motion.div 
                className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-red-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              />
              
               {/* 始终显示canvas元素，但在没有内容时隐藏 */}
              <div className="w-[260px] sm:w-[300px] h-[260px] sm:h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 relative">
                {/* 确保canvas元素始终存在 */}
                <motion.canvas 
                  ref={canvasRef} 
                  className={`rounded-lg shadow-sm ${!qrCodeDataUrl && !isGenerating ? 'opacity-0' : 'opacity-100'}`}
                  aria-label="生成的二维码"
                  width={260}
                  height={260}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: qrCodeDataUrl ? 1 : 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                ></motion.canvas>
                
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 dark:bg-slate-800/90 rounded-xl">
                    <motion.div 
                      className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                    <p className="mt-3 text-base text-slate-500 dark:text-slate-400">生成中...</p>
                  </div>
                ) : !qrCodeDataUrl ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      <motion.i 
                        className="fa-solid fa-qrcode text-5xl text-slate-300 dark:text-slate-700 mb-3"
                        animate={{ 
                          opacity: [0.7, 1, 0.7],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      ></motion.i>
                    </motion.div>
                    <motion.p 
                      className="text-sm text-slate-500 dark:text-slate-400"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      输入内容以生成二维码
                    </motion.p>
                  </div>
                ) : (
                  <div className="absolute -bottom-5 right-0 flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={copyToClipboard}
                      className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 active:scale-90"
                      aria-label="复制二维码"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: -15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={printQRCode}
                      className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 active:scale-90"
                      aria-label="打印二维码"
                    >
                      <i className="fa-solid fa-print"></i>
                    </motion.button>
                  </div>
                )}
              </div>
              
              {/* 二维码信息 */}
              {qrCodeDataUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-center"
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[260px] sm:max-w-[300px]">
                    {inputText.length > 30 ? inputText.substring(0, 30) + '...' : inputText}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    尺寸: {qrSize}x{qrSize}px · 纠错级别: {errorCorrectionLevel}
                  </p>
                </motion.div>
              )}
            </motion.div>
            
              {qrCodeDataUrl && (
                <motion.a
                  href={qrCodeDataUrl}
                  download={`qrcode.${outputFormat}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-12 px-8 py-3.5 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-300 flex items-center active:scale-98"
                >
                  <i className="fa-solid fa-download mr-2"></i>
                  下载二维码 ({outputFormat.toUpperCase()})
                </motion.a>
              )}
          </motion.div>
        </div>
       </motion.main>
       
       {/* 页脚信息 */}
       <motion.footer
         className="w-full max-w-4xl mt-8 text-center text-sm text-slate-500 dark:text-slate-400 py-4"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1, duration: 0.5 }}
       >
         <p className="mb-1">
           {appConfig?.footer?.copyright?.replace('{currentYear}', new Date().getFullYear().toString()) || 
            defaultConfig.footer.copyright.replace('{currentYear}', new Date().getFullYear().toString())}
         </p>
         <p>
           {appConfig?.footer?.tagline || defaultConfig.footer.tagline}
         </p>
       </motion.footer>
    </div>
  );
}