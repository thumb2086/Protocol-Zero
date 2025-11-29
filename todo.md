# Protocol: Zero - 開發計劃

## 📋 Phase 1: 引擎與工廠核心 (Engine & Foundry)

### ✅ 已完成
- [x] Init: 建立 Electron + Babylon + Havok 專案
- [x] 基礎 FPS 控制器（移動、跳躍、視角）
- [x] 基礎武器生成（Vandal, Phantom, Classic）
- [x] CSG Factory: ReceiverFactory, BarrelFactory 實作
- [x] 基礎 Assembler: 將零件組裝成整槍

### 🚧 進行中 - 工廠系統完整重構
- [x] **Blueprint System (藍圖系統)**
  - [x] BlueprintDefinition.ts: 完整型別定義
  - [x] BlueprintValidator.ts: 驗證邏輯與平衡限制
  - [x] PartLibrary.ts: 零件資料庫
- [x] **Part Designer (零件設計器)**
  - [x] 更新 ComponentFactory: 改用配置物件 API
  - [x] 實作數值修飾符系統（metadata 儲存）
- [x] **Weapon Assembler (組裝器)**
  - [x] assembleFromBlueprint: 從藍圖生成武器
  - [x] calculateFinalStats: 計算最終數值
  - [x] serializeToBlueprint: 匯出藍圖
- [ ] **Blueprint Manager (藍圖管理)**
  - [ ] BlueprintManager.ts: 檔案 I/O
  - [ ] IPC 整合 (preload + main)
- [ ] **GitHub Sync (GitHub 同步)**
  - [ ] GitHubSync.ts: Octokit 整合
  - [ ] Fork + PR 工作流
  - [ ] 社群藍圖拉取
- [ ] **Foundry UI Overhaul (UI 改版)**
  - [ ] Designer Panel: 零件拖放設計器
  - [ ] Stats Preview: 實時數值預覽
  - [ ] Blueprint Library: 藍圖瀏覽器
  - [ ] FoundryController: 新增匯出/上傳方法

---

## 📋 Phase 2: 玩家與射擊 (Player & Combat)

### ✅ 已完成
- [x] Controller: Havok Capsule Controller (WASD 移動)
- [x] Shooting: Raycast Hitscan, Recoil (Camera + Gun Offset)
  - [ ] Shell Ejection（彈殼拋出）

### 📝 待實作
- [ ] 完整傷害模型
  - [ ] 頭部 4.0x
  - [ ] 身體 1.0x
  - [ ] 腿部 0.85x
- [ ] Counter-Strafing（急停機制）
- [ ] Air Control（空中控制）

---

## 📋 Phase 3: 連線與網路 (Networking)

### 📝 待實作
- [ ] UDP Layer: 實作 Node.js dgram Server/Client
- [ ] State Sync: 同步玩家位置 (X,Y,Z, Rot) 與槍枝狀態 (Firing, Reloading)
- [ ] Netcode
  - [ ] 插值 (Snapshot Interpolation)
  - [ ] 回溯 (Lag Compensation / Rewind)
  - [ ] Tick Rate 64Hz
- [ ] Playit.gg 整合（穿透 NAT）

---

## 📋 Phase 4: 遊戲循環與 UI (Loop & UI)

### ✅ 已完成
- [x] Map Parser: ASCII 地圖生成器 (ThinInstances)
- [x] 基礎 UI Manager（主選單、Foundry 面板）

### 📝 待實作
- [ ] Game Logic
  - [ ] 13 回合制
  - [ ] 炸彈 (Spike) 安裝/拆除邏輯
  - [ ] 經濟計算（勝利/失敗/擊殺獎金）
- [ ] UI完善
  - [ ] 購買選單（讀取 JSON 槍枝）
  - [ ] 計分板
  - [ ] 擊殺提示
  - [ ] 回合計時器
  - [ ] 團隊選擇 UI
  - [x] 完善 Foundry UI（零件選擇、數值顯示）
  - [x] 修復選單功能（確保所有按鈕可用）

---

## 📋 額外功能 (Extra Features)

### 🎨 程式化皮膚系統
- [ ] DynamicTexture 繪製圖案
- [ ] Slash 圖案（45度斜線）
- [ ] Zebra 圖案（Perlin Noise 斑馬紋）
- [ ] Camouflage 圖案（迷彩）
- [ ] 從 JSON 讀取 skin 設定

### 🌐 GitHub 整合
- [ ] Octokit 認證（Personal Access Token）
- [ ] 上傳流程
  - [ ] 遊戲內設計槍枝存為 JSON
  - [ ] 匯出到玩家 Fork
  - [ ] 自動對官方 Repo 發起 Pull Request
- [ ] 驗證機制
  - [ ] GitHub Actions 自動檢查數值
  - [ ] damage > 100 => reject
  - [ ] fireRate > 20 => reject
- [ ] 自動同步社群槍枝

### 🗺️ 地圖系統
- [ ] 新增更多地圖
  - [ ] 經典「三路圖」結構（A點/中路/B點）
  - [ ] Cover（掩體箱子）
- [ ] 地圖選擇 UI

---

## 🐛 已知問題 (Known Issues)

- [x] ~~FPSController.ts TypeScript 錯誤~~（已修復）
- [x] ~~main.ts top-level await 錯誤~~（已修復）
- [ ] 物理碰撞偵測可能需要優化（高速子彈可能穿透）
- [ ] 武器重疊問題（需確保只使用 WeaponAssembler）

---

## 📌 優先級排序

### 🔴 高優先級（下一步）
1. 完善模組化零件系統（TransformNode 掛載點）
2. 實作 Repo Sync（自動 Clone/Pull protocol-foundry-repository）
3. 完善後座力模型（Pattern 系統）
4. 新增 VFX/SFX（彈孔、槍聲、槍口火焰）

### 🟡 中優先級
1. 實作經濟系統與購買選單
2. 實作回合制邏輯
3. 新增更多零件類型（Stock, Scope, Magazine）

### 🟢 低優先級
1. 網路連線（UDP + Netcode）
2. 程式化皮膚系統
3. GitHub 整合
4. 新增更多地圖
