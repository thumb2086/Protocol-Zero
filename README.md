# Protocol Zero

一個基於 Electron、Babylon.js 和 Havok Physics 構建的桌面 3D FPS 遊戲，靈感來自特戰英豪（Valorant）的核心機制。

## 🚀 Quick Start

1. **安裝依賴:**
   ```bash
   npm install
   ```

2. **開發模式:**
   ```bash
   npm run dev
   ```

3. **編譯打包:**
   ```bash
   npm run build
   ```

4. **預覽:**
   ```bash
   npm run preview
   ```

## 🎮 專案結構

```
Protocol-Zero/
├── src/
│   ├── main/          # Electron 主進程
│   ├── preload/       # Preload 腳本
│   └── renderer/      # 渲染進程（遊戲邏輯）
├── out/               # 編譯輸出
├── protocol-foundry/  # 實驗性 Tailwind UI 版本
├── electron.vite.config.ts
├── package.json
└── tsconfig.json
```

## 🎯 技術棧

- **遊戲引擎:** Babylon.js 8.x (WebGPU)
- **物理引擎:** Havok Physics
- **桌面框架:** Electron 39.x
- **開發工具:** Vite + TypeScript
- **語言:** TypeScript

## 🗺️ 功能特色

- **3D 第一人稱控制:** 使用 Babylon.js 實現流暢的 3D 渲染和移動
- **物理系統:** Havok Physics 提供真實的物理模擬
- **武器系統:** 多種武器類型，包含射擊、裝填等機制
- **桌面應用:** 使用 Electron 打包為原生桌面應用

## 📝 開發說明

本專案使用 `electron-vite` 進行開發和打包：

- **主進程 (Main):** 負責視窗管理和系統 API
- **渲染進程 (Renderer):** 遊戲邏輯和 UI
- **Preload:** 安全地暴露 Electron API 給渲染進程

## 🔧 其他專案

- **protocol-foundry/**: 使用 Tailwind CSS 的實驗性 UI 版本

## 📄 License

ISC