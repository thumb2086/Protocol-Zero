# Protocol: Zero

> **代號: "The Parametric Shooter"**  
> 100% 程式碼生成、無外部美術資產依賴、Git 驅動的社群生態

一個基於 Electron + Babylon.js + Havok Physics 構建的競技 FPS 遊戲，靈感來自特戰英豪（Valorant）。所有武器和地圖皆為程式化生成，支援社群透過 GitHub 共享槍枝設計。

---

## 🚀 Quick Start

```bash
# 安裝依賴
npm install

# 開發模式（啟動 Electron + Babylon.js）
npm run dev

# 編譯打包
npm run build
```

---

## 🎯 核心理念

### 1. **100% 程式化生成 (Procedural Generation)**
- 所有武器使用 **CSG (Constructive Solid Geometry)** 和 **MeshBuilder** 動態生成
- 地圖使用 **ASCII Grid Parser** + **ThinInstances** 渲染
- 材質使用 **PBR + Procedural Textures**，無需外部貼圖

### 2. **模組化武器系統 (Protocol-Foundry)**
- 槍枝由 **零件 (Parts)** 組裝而成：機匣、槍管、槍托、彈匣、瞄具
- 所有零件定義為 **JSON 藍圖**，存放於 `protocol-foundry/`
- 支援 **熱插拔 (Hot-Swap)**，即時更換零件無需重載整把槍

### 3. **GitHub 協作生態**
- 玩家可在遊戲內設計槍枝，並透過 **Octokit** 直接提交到 GitHub
- 自動 **Clone/Pull** 社群槍枝到本地 `protocol-foundry-repository/`
- 使用 **GitHub Actions** 驗證平衡性（傷害、射速上限檢查）

---

## 🎮 專案架構

```
Protocol-Zero/
├── src/
│   ├── main/                    # Electron 主進程
│   │   └── index.ts             # 視窗管理、IPC、GitHub API
│   ├── preload/                 # Preload 腳本（IPC Bridge）
│   └── renderer/
│       ├── controllers/         # FPS 控制器、HUD、UI 管理
│       │   ├── FPSController.ts # 移動、射擊、後座力
│       │   ├── HUDController.ts # 準心、血量、彈藥顯示
│       │   └── UIManager.ts     # 主選單、軍火庫 UI
│       ├── generators/          # 程式化生成器
│       │   ├── WeaponAssembler.ts   # 組裝槍枝（從 JSON）
│       │   ├── ComponentFactory.ts  # 生成零件（機匣、槍管）
│       │   ├── MapGenerator.ts      # 地圖生成（The Range）
│       │   └── CharacterGenerator.ts # 角色模型
│       ├── utils/
│       │   ├── GitHubWeaponLoader.ts # 從 GitHub 加載社群槍枝
│       │   └── FoundryLoader.ts      # 本地藍圖加載器
│       └── src/
│           └── main.ts          # 遊戲入口（場景初始化）
├── protocol-foundry/            # 武器編輯器 UI（React + Tailwind）
├── blueprints/                  # 槍枝藍圖（JSON）
│   ├── vandal.json
│   ├── phantom.json
│   └── classic.json
└── parts/                       # 零件定義（JSON）
    ├── receiver_*.json
    ├── barrel_*.json
    └── stock_*.json
```

---

## 🔧 技術棧

| 層級 | 技術 | 用途 |
|------|------|------|
| **執行環境** | Electron 39.x | 桌面應用殼層、Node.js API |
| **渲染引擎** | Babylon.js 8.x | 3D 渲染（WebGPU/WebGL2） |
| **物理引擎** | Havok Physics (WASM) | 角色移動、彈道物理 |
| **網路層** | Node.js `dgram` (UDP) | P2P 連線、Tick-based Netcode |
| **版本控制** | Octokit + isomorphic-git | GitHub 整合（自動 Clone/Push） |
| **開發工具** | Vite + TypeScript | 熱重載、型別安全 |

---

## 🗺️ 核心功能

### ✅ 已實現 (Implemented)
- **第一人稱控制器 (FPS Controller)**
  - WASD 移動 + 滑鼠視角控制
  - 慣性系統（加速/摩擦）
  - 跳躍 + 重力
  - Pointer Lock API

- **程式化武器生成 (Procedural Weapons)**
  - Vandal、Phantom、Classic 三種基礎槍型
  - CSG Boolean 生成機匣、槍管、彈匣
  - PBR 材質 + 邊緣發光 (Glow Layer)

- **射擊系統 (Gunplay)**
  - Hitscan 射線檢測
  - 彈道物理（重力因子可調）
  - 彈藥系統（當前/備彈）
  - HUD 顯示（準心、彈藥數）

- **地圖生成 (Map: The Range)**
  - 訓練場地圖（The Range）
  - 程式化地板、牆壁、柱子
  - 動態光照（HemisphericLight + DirectionalLight）

### � 進行中 (In Progress)
- **模組化零件系統 (Modular Components)**
  - 零件掛載點系統（TransformNode）
  - 熱插拔零件（無需重載整把槍）
  - 零件統計加成（射速、射程、後座力）

- **程式化皮膚 (Procedural Skins)**
  - DynamicTexture 繪製圖案
  - Slash、Zebra、Camouflage 等紋理

### 📋 計劃中 (Planned)
- **網路連線 (Networking)**
  - UDP Tick-based Server (64Hz)
  - 延遲補償 (Lag Compensation)
  - 快照插值 (Snapshot Interpolation)

- **遊戲循環 (Game Loop)**
  - 13 回合制
  - 炸彈安裝/拆除
  - 經濟系統（購買槍枝）

- **GitHub 整合 (GitHub Integration)**
  - 遊戲內匯出槍枝到 GitHub
  - 自動 Clone 社群槍枝
  - GitHub Actions 驗證平衡性

---

## 🛠️ 開發工作流

1. **啟動遊戲:** `npm run dev`
2. **修改藍圖:** 編輯 `blueprints/*.json` 或 `parts/*.json`
3. **熱重載:** Vite 自動重載，無需重啟
4. **測試射擊:** 點擊畫面進入 Pointer Lock，左鍵射擊

---

## � 雙儲存庫策略

| Repo | 用途 | 內容 |
|------|------|------|
| **Protocol-Zero** | 遊戲引擎 | 渲染器、FPS 控制、UI、網路層 |
| **protocol-foundry-repository** | 數據庫 | JSON 藍圖、零件定義、社群槍枝 |

遊戲啟動時會自動 **Clone/Pull** `protocol-foundry-repository` 到本地，確保玩家擁有最新社群內容。

---

## 📄 License

ISC