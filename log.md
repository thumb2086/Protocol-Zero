# 變更日誌

## 2025-11-29

### 模組化零件系統 (Modular Component System)
- **新增零件工廠**:
  - `createScope`: 支援 `red_dot` (紅點), `holo` (全息), `sniper` (狙擊鏡)。
  - `createGrip`: 支援 `vertical` (垂直握把), `angled` (三角握把)。
- **WeaponAssembler 更新**:
  - `assembleWeapon` 現在支援 `scope` 和 `grip` 參數。
  - `generateVandal` 預設裝備 `red_dot` 和 `angled` 握把。
  - `generatePhantom` 預設裝備 `red_dot` 和 `vertical` 握把。

### 視覺與模型升級 (Visual & Model Overhaul)
- **ComponentFactory.ts 重寫**:
  - **Vandal (暴徒)**: 新增 AK 風格機匣、導氣管、香蕉彈匣、鏤空槍托。
  - **Phantom (幻象)**: 新增消音器、長護木、伸縮槍托、現代機匣。
  - **Classic (制式手槍)**: 新增滑套、握把、扳機護弓。
  - **材質優化**: 為不同部件定義了更細緻的材質與顏色。
- **WeaponAssembler.ts 更新**: 支援傳遞武器樣式參數 ('vandal', 'phantom', 'classic') 給工廠方法。

### 功能實作 (Features)
- **Repo Sync (自動同步)**:
  - 新增 `RepoManager.ts`: 使用 `isomorphic-git` 實作 Git Clone/Pull 功能。
  - `src/main/index.ts`: 啟動時自動同步 `protocol-foundry-repository` 到 `AppData/foundry`。
- **IPC 修復**:
  - `src/main/index.ts`: 新增 `weapon:select` IPC 處理程序，解決選擇武器時的報錯。

### 修復 IDE 錯誤
- **FPSController.ts**:
  - 新增 `ExecuteCodeAction`, `ActionEvent`, `AbstractMesh` 至 imports
  - 移除 `BABYLON.` 前綴，直接使用 imported classes
  - 修正 `evt` 參數的隱含 `any` 類型為 `ActionEvent`
  - 修正 `registerOnPhysicsCollide` 參數類型，將 `AbstractMesh[]` 轉換為 `PhysicsImpostor[]`
  - 修正回調函數中的 mesh 比較邏輯，使用 `collided.object as AbstractMesh`

- **main.ts**:
  - 修正 top-level await 錯誤，將 `uiManager.onStartGame` 回調標記為 `async`
