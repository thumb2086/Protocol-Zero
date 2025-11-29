# 變更日誌

## 2025-11-29

### 修復 IDE 錯誤
- **FPSController.ts**:
  - 新增 `ExecuteCodeAction`, `ActionEvent`, `AbstractMesh` 至 imports
  - 移除 `BABYLON.` 前綴，直接使用 imported classes
  - 修正 `evt` 參數的隱含 `any` 類型為 `ActionEvent`
  - 修正 `registerOnPhysicsCollide` 參數類型，將 `AbstractMesh[]` 轉換為 `PhysicsImpostor[]`
  - 修正回調函數中的 mesh 比較邏輯，使用 `collided.object as AbstractMesh`

- **main.ts**:
  - 修正 top-level await 錯誤，將 `uiManager.onStartGame` 回調標記為 `async`
