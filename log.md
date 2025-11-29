# 變更日誌

## 2025-11-29

### 模組化零件系統 (Modular Component System)
- **新增 `IWeaponPart.ts`**: 定義武器零件介面與統計數值結構。
- **新增 `ComponentFactory.ts`**: 
  - 實作 `createReceiver`: 包含 `barrel_mount`, `stock_mount`, `mag_mount`, `scope_mount` 等 TransformNode 掛載點。
  - 實作 `createBarrel`, `createStock`, `createMagazine`: 基礎零件生成邏輯。
- **重構 `WeaponAssembler.ts`**:
  - 新增 `assembleWeapon`: 透過掛載點將零件組裝成整槍。
  - 重構 `generateVandal`: 改用 `assembleWeapon` 進行組裝。
  - 更新 `swapComponent`: 支援基於新架構的零件熱插拔。

### 修復 IDE 錯誤
- **FPSController.ts**:
  - 新增 `ExecuteCodeAction`, `ActionEvent`, `AbstractMesh` 至 imports
  - 移除 `BABYLON.` 前綴，直接使用 imported classes
  - 修正 `evt` 參數的隱含 `any` 類型為 `ActionEvent`
  - 修正 `registerOnPhysicsCollide` 參數類型，將 `AbstractMesh[]` 轉換為 `PhysicsImpostor[]`
  - 修正回調函數中的 mesh 比較邏輯，使用 `collided.object as AbstractMesh`

- **main.ts**:
  - 修正 top-level await 錯誤，將 `uiManager.onStartGame` 回調標記為 `async`
