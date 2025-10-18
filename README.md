# QR Code Generator

![QR Code Generator](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.2.0-blue.svg)

一个功能丰富、界面美观的二维码生成工具，支持多种自定义选项和导出格式。

## ✨ 特性

- 🎨 **丰富的自定义选项**
  - 自定义前景色和背景色
  - 调整二维码大小
  - 选择错误修正级别（L/M/Q/H）
  - 多种图案类型（方形、圆形、菱形）
  - 5种精美的预设模板

- 📱 **Logo集成**
  - 支持添加中心Logo图片
  - 自定义Logo大小
  - 添加Logo边框和阴影效果

- 💾 **多种输出格式**
  - PNG格式导出
  - JPG格式导出
  - SVG格式导出（矢量图，无损缩放）

- 💾 **历史记录**
  - 自动保存生成记录
  - 一键重新生成历史二维码

- 🌓 **深色模式支持**
  - 自动跟随系统主题
  - 支持手动切换深色/浅色模式

- 📱 **响应式设计**
  - 完美适配桌面端和移动端
  - 优化的触摸交互体验

## 🛠 技术栈

- **前端框架**: React 18.3.1
- **类型系统**: TypeScript 5.7.2
- **构建工具**: Vite 6.2.0
- **样式方案**: Tailwind CSS 3.4.17
- **动画效果**: Framer Motion 12.9.2
- **二维码生成**: qrcode 1.5.3
- **UI组件**: 自定义组件 + Tailwind CSS
- **状态管理**: React Hooks + Context API
- **路由**: React Router 7.3.0

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- pnpm >= 8.x（推荐）或npm/yarn

### 安装和运行

1. 克隆项目
```bash
git clone <repository-url>
cd qrcode-generator
```

2. 安装依赖
```bash
pnpm install
# 或者
npm install
# 或者
yarn install
```

3. 启动开发服务器
```bash
pnpm dev
# 或者
npm run dev
# 或者
yarn dev
```

4. 访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
# 或者
npm run build
# 或者
yarn build
```

构建产物将输出到 `dist` 目录。

## 🎯 使用指南

### 基本使用

1. 在文本框中输入网址、文本或其他内容
2. 二维码将自动生成并显示
3. 点击下载按钮保存二维码图片

### 自定义二维码

1. **颜色设置**：使用颜色选择器自定义前景色和背景色
2. **大小调整**：拖动滑块调整二维码尺寸
3. **图案类型**：选择方形、圆形或菱形的二维码样式
4. **模板选择**：应用预设的精美模板快速美化二维码
5. **错误修正级别**：根据需要选择不同的纠错级别，H级别的容错率最高

### 添加Logo

1. 点击上传按钮选择Logo图片
2. 调整Logo大小滑块设置合适的尺寸比例
3. 可选择性地添加边框和阴影效果

### 历史记录

- 每次生成的二维码会自动保存到本地历史记录
- 点击历史记录按钮查看和管理生成历史
- 点击历史记录项可快速重新生成对应二维码

## 📁 项目结构

```
src/
├── components/      # 自定义组件
├── config/          # 配置文件
├── contexts/        # React Context
├── hooks/           # 自定义Hooks
├── lib/             # 工具函数和类型定义
├── pages/           # 页面组件
├── App.tsx          # 应用入口组件
├── main.tsx         # 应用入口文件
└── index.css        # 全局样式
```

## 🎨 主要组件

- **CustomColorPicker**: 颜色选择器组件
- **CustomFileUpload**: 文件上传组件，用于Logo上传
- **CustomSelect**: 自定义下拉选择组件
- **CustomToggle**: 切换开关组件
- **HistoryList**: 历史记录列表组件
- **TemplateSelector**: 模板选择器组件

## 🔧 配置说明

项目支持通过 `src/config/appConfig.txt` 文件自定义应用配置：

```
# 网站配置
site.title=QR Code Generator
site.description=输入URL或文本，一键生成二维码

# 页脚配置
footer.copyright=© {currentYear} QR Code Generator. All rights reserved.
footer.tagline=简单、高效的二维码生成工具
```

## 📱 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 🌟 Star 历史

如果这个项目对你有帮助，请给它一个 Star ⭐