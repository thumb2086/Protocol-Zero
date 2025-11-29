# 變更日誌

## 2025-11-30

### 工廠系統完整重構 (Foundry System Redesign)
- **Blueprint System (藍圖系統)**:
  - 新增 `BlueprintDefinition.ts`: 完整的武器藍圖型別系統
    - `WeaponBlueprint`: 主要藍圖介面，包含 id, name, author, components, stats
    - `WeaponComponents`: 零件配置（receiver, barrel, stock, magazine, scope, grip）
    - `WeaponStats`: 完整數值定義（傷害、射速、後座力圖案等）
    - `ScopeConfig`, `GripConfig`, `StockConfig` 等零件配置介面
    - `createDefaultBlueprint()`: 預設藍圖生成器
  - 新增 `BlueprintValidator.ts`: 遊戲平衡驗證器
    - 數值上限檢查（damage <= 100, fireRate <= 1200）
    - 零件修飾符限制（recoil reduction <= 30%）
    - 必填欄位驗證
    - 警告系統（過強組合提示）
  - 新增 `PartLibrary.ts`: 零件資料庫
    - `SCOPE_LIBRARY`: 4 種瞄具（red_dot, holo, acog, sniper_8x）
    - `GRIP_LIBRARY`: 3 種握把（vertical, angled, stub）
    - `STOCK_LIBRARY`: 3 種槍托（fixed, collapsible, heavy）
    - `BARREL_LIBRARY`: 4 種槍管（standard, long, short, silenced）
    - `MAGAZINE_LIBRARY`: 5 種彈匣配置
    - `SKIN_LIBRARY`: 6 種皮膚（包含 flux, gaia, voxel 等）
    - 輔助函數：`getPart()`, `getPartsByType()`, `partExists()`

- **Part Designer (零件設計器)**:
  - 更新 `ComponentFactory.ts`:
    - `createScope()` 現接受 `ScopeConfig` 物件（保留字串參數向下相容）
    - `createGrip()` 現接受 `GripConfig` 物件（保留字串參數向下相容）
    - 所有零件自動儲存配置到 `mesh.metadata`，包含數值修飾符
    - 新增 PartLibrary 自動查詢邏輯

- **Weapon Assembler (組裝器增強)**:
  - 新增 `assembleFromBlueprint(blueprint: WeaponBlueprint)`:
    - 從藍圖 JSON 一鍵生成完整武器
    - 自動組裝所有零件（receiver, barrel, stock, magazine, scope, grip）
    - 儲存藍圖到 mesh.metadata
  - 新增 `calculateFinalStats(blueprint)`:
    - 計算最終武器數值（基礎值 + 所有零件修飾符）
    - 槍管：射程和彈速修飾
    - 瞄具：ADS 速度修飾
    - 槍托：後座力減免
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
